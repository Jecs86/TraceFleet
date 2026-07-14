import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { DocumentosVehiculoService } from './documentos-vehiculo.service';
import { CreateDocumentoVehiculoDto } from './dto/create-documento-vehiculo.dto';
import { UpdateDocumentoVehiculoDto } from './dto/update-documento-vehiculo.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { Usuario } from '../generated/prisma/client';

const multerMemory = { storage: memoryStorage() };
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

// Tipo local mientras @types/multer no esté instalado
interface UploadedFileData {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

@UseGuards(JwtAuthGuard)
@Controller('documentos-vehiculo')
export class DocumentosVehiculoController {
  constructor(
    private readonly documentosVehiculoService: DocumentosVehiculoService,
  ) {}

  /**
   * POST /documentos-vehiculo
   * Crea el registro de documento. Acepta JSON puro (sin archivo).
   * Para adjuntar el archivo usa POST /documentos-vehiculo/:id/archivo.
   */
  @Post()
  create(
    @Body() createDto: CreateDocumentoVehiculoDto,
    @CurrentUser() currentUser: Usuario & { empresa: any },
  ) {
    return this.documentosVehiculoService.create(createDto, currentUser);
  }

  @Get()
  findAll(@CurrentUser() currentUser: Usuario & { empresa: any }) {
    return this.documentosVehiculoService.findAll(currentUser);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser() currentUser: Usuario & { empresa: any },
  ) {
    return this.documentosVehiculoService.findOne(id, currentUser);
  }

  /**
   * PATCH /documentos-vehiculo/:id
   * Actualiza metadatos del documento. Acepta JSON puro.
   */
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateDocumentoVehiculoDto,
    @CurrentUser() currentUser: Usuario & { empresa: any },
  ) {
    return this.documentosVehiculoService.update(id, updateDto, currentUser);
  }

  /**
   * DELETE /documentos-vehiculo/:id
   * Elimina el registro y el archivo del storage si existe.
   */
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser() currentUser: Usuario & { empresa: any },
  ) {
    return this.documentosVehiculoService.remove(id, currentUser);
  }

  /**
   * POST /documentos-vehiculo/:id/archivo
   * Sube el archivo (PDF o imagen) a Supabase Storage y guarda la URL en BD.
   * Ruta en Storage: documentos/{empresa}/{placa}/{tipoDocumento}-{timestamp}.{ext}
   * Acepta multipart/form-data con campo "archivo" (pdf/jpg/png/webp, máx 20 MB).
   */
  @Post(':id/archivo')
  @UseInterceptors(FileInterceptor('archivo', multerMemory))
  uploadArchivo(
    @Param('id') id: string,
    @CurrentUser() currentUser: Usuario & { empresa: any },
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_FILE_SIZE }),
          new FileTypeValidator({
            fileType: /application\/pdf|image\/(jpeg|jpg|png|webp)/,
          }),
        ],
        fileIsRequired: true,
      }),
    )
    archivo: UploadedFileData,
  ) {
    const extension =
      archivo.originalname.split('.').pop()?.toLowerCase() ?? 'bin';

    return this.documentosVehiculoService.uploadArchivo(
      id,
      currentUser,
      archivo.buffer,
      archivo.mimetype,
      extension,
    );
  }
}
