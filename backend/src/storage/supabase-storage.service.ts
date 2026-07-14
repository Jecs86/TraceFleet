import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import sharp from 'sharp';

/**
 * Estructura de carpetas en Supabase Storage:
 *
 * Bucket "documentos":
 *   documentos/{nombreEmpresa}/{placaVehiculo}/{tipoDocumento}-{timestamp}.{ext}
 *
 * Bucket "imagenes":
 *   imagenes/{placaVehiculo}.webp   ← comprimida con sharp
 */

const BUCKET_DOCUMENTOS = 'documentos';
const BUCKET_IMAGENES   = 'imagenes';

// Configuración de compresión para imágenes de vehículos
const IMAGE_CONFIG = {
  width:   800,    // px máximo — suficiente para vista en dashboard
  quality: 75,     // % calidad WebP (buen balance tamaño/calidad)
};

@Injectable()
export class SupabaseStorageService {
  private readonly client: SupabaseClient;
  private readonly logger = new Logger(SupabaseStorageService.name);

  constructor() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
      throw new Error(
        'SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY deben estar definidos en .env',
      );
    }

    this.client = createClient(url, key, {
      auth: { persistSession: false },
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // IMÁGENES DE VEHÍCULOS
  // Ruta: imagenes/{placa}.webp
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Comprime y sube la imagen de un vehículo.
   * Convierte cualquier formato (jpg, png, heic…) a WebP redimensionado.
   * Sobreescribe si ya existe (upsert: true).
   * @returns URL pública permanente
   */
  async uploadImagenVehiculo(
    placa: string,
    buffer: Buffer,
  ): Promise<string> {
    // Normalizar placa para nombre de archivo (quitar guiones, espacios → mayúsculas)
    const nombreArchivo = `${placa.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()}.webp`;
    const storagePath   = nombreArchivo; // raíz del bucket "imagenes"

    // Comprimir con sharp antes de subir
    const comprimida = await sharp(buffer)
      .resize({ width: IMAGE_CONFIG.width, withoutEnlargement: true })
      .webp({ quality: IMAGE_CONFIG.quality })
      .toBuffer();

    this.logger.log(
      `Imagen vehículo ${placa}: ${buffer.length} → ${comprimida.length} bytes (WebP q${IMAGE_CONFIG.quality})`,
    );

    const { error } = await this.client.storage
      .from(BUCKET_IMAGENES)
      .upload(storagePath, comprimida, {
        contentType: 'image/webp',
        upsert: true, // sobreescribe si la placa ya tiene imagen
      });

    if (error) {
      this.logger.error(`Error subiendo imagen de ${placa}:`, error.message);
      throw new InternalServerErrorException(
        `No se pudo subir la imagen del vehículo: ${error.message}`,
      );
    }

    return this.getPublicUrl(BUCKET_IMAGENES, storagePath);
  }

  /** Elimina la imagen de un vehículo. No lanza error si no existe. */
  async deleteImagenVehiculo(placa: string): Promise<void> {
    const nombreArchivo = `${placa.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()}.webp`;
    await this.client.storage
      .from(BUCKET_IMAGENES)
      .remove([nombreArchivo]);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // DOCUMENTOS DE VEHÍCULOS
  // Ruta: {nombreEmpresa}/{placa}/{tipoDocumento}-{timestamp}.{ext}
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Sube un documento de vehículo al bucket "documentos".
   * @param nombreEmpresa  Nombre de la empresa (carpeta raíz)
   * @param placa          Placa del vehículo (subcarpeta)
   * @param tipoDocumento  Tipo de documento para el nombre de archivo
   * @param buffer         Contenido del archivo
   * @param mimeType       MIME type (ej: 'application/pdf', 'image/jpeg')
   * @param extension      Extensión del archivo (ej: 'pdf', 'jpg')
   * @returns URL pública permanente
   */
  async uploadDocumentoVehiculo(
    nombreEmpresa: string,
    placa: string,
    tipoDocumento: string,
    buffer: Buffer,
    mimeType: string,
    extension: string,
  ): Promise<string> {
    const carpetaEmpresa = this.slugify(nombreEmpresa);
    const carpetaPlaca   = placa.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const nombreArchivo  = `${this.slugify(tipoDocumento)}-${Date.now()}.${extension}`;
    const storagePath    = `${carpetaEmpresa}/${carpetaPlaca}/${nombreArchivo}`;

    const { error } = await this.client.storage
      .from(BUCKET_DOCUMENTOS)
      .upload(storagePath, buffer, {
        contentType: mimeType,
        upsert: false, // los documentos son históricos, no se sobreescriben
      });

    if (error) {
      this.logger.error(`Error subiendo documento ${storagePath}:`, error.message);
      throw new InternalServerErrorException(
        `No se pudo subir el documento: ${error.message}`,
      );
    }

    return this.getPublicUrl(BUCKET_DOCUMENTOS, storagePath);
  }

  /** Elimina un archivo de documento dado su URL pública. No lanza error si no existe. */
  async deleteDocumento(archivoUrl: string): Promise<void> {
    const path = this.extractPathFromUrl(archivoUrl, BUCKET_DOCUMENTOS);
    if (!path) return;
    await this.client.storage.from(BUCKET_DOCUMENTOS).remove([path]);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Helpers privados
  // ─────────────────────────────────────────────────────────────────────────────

  private getPublicUrl(bucket: string, path: string): string {
    const { data } = this.client.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  /** Convierte un nombre con espacios/acentos a slug seguro para rutas de Storage. */
  private slugify(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // quitar acentos
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  /**
   * Extrae la ruta relativa dentro del bucket a partir de la URL pública.
   * Ej: "https://xxx.supabase.co/storage/v1/object/public/documentos/empresa/placa/doc.pdf"
   *      → "empresa/placa/doc.pdf"
   */
  private extractPathFromUrl(url: string, bucket: string): string | null {
    try {
      const marker = `/object/public/${bucket}/`;
      const idx = url.indexOf(marker);
      if (idx === -1) return null;
      return decodeURIComponent(url.substring(idx + marker.length));
    } catch {
      return null;
    }
  }
}
