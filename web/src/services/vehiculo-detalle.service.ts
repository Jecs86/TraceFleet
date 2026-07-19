import api from './api';

// Interfaces basadas en tu esquema de Prisma
export interface Documento {
  id: string;
  tipoDocumento: string;
  fechaEmision: string | null;
  fechaExpiracion: string | null;
  archivoUrl: string | null;
}

export interface Mantenimiento {
  id: string;
  fecha: string;
  tipo: string;
  descripcion: string;
  taller: string | null;
  costo: number;
  kilometraje: number;
}

export interface VehiculoDetalle {
  id: string;
  placa: string;
  tipo: string; // Actuará como 'Modelo' en la UI
  marca: string | null;
  estadoOperativo: boolean;
  imagenUrl: string | null;
  documentos: Documento[];
  mantenimientos: Mantenimiento[];
}

export const vehiculoDetalleService = {
  /**
   * Obtiene toda la información de un vehículo, incluyendo sus relaciones
   * (documentos e historial de mantenimiento).
   */
  getVehiculoCompleto: async (id: string): Promise<VehiculoDetalle> => {
    try {
      // Se espera que el backend retorne el vehículo con un JOIN (include) de documentos y mantenimientos
      const response = await api.get(`/vehiculos/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener los detalles del vehículo ${id}:`, error);
      throw error;
    }
  },

  /**
   * Helper para evaluar el estado del seguro basándose en la fecha de expiración.
   */
  evaluarEstadoSeguro: (documentos: Documento[]): { texto: string; operativo: boolean } => {
    const seguro = documentos.find(
      doc => doc.tipoDocumento.toLowerCase().includes('seguro') || doc.tipoDocumento.toLowerCase().includes('póliza')
    );

    if (!seguro || !seguro.fechaExpiracion) {
      return { texto: 'Sin registro', operativo: false };
    }

    const hoy = new Date();
    const fechaExpiracion = new Date(seguro.fechaExpiracion);

    if (fechaExpiracion >= hoy) {
      return { texto: 'Vigente', operativo: true };
    } else {
      return { texto: 'Caducado', operativo: false };
    }
  }
};