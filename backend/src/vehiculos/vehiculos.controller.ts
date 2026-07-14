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
import { VehiculosService } from './vehiculos.service';
import { CreateVehiculoDto } from './dto/create-vehiculo.dto';
import { UpdateVehiculoDto } from './dto/update-vehiculo.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { Usuario } from '../generated/prisma/client';

const multerMemory = { storage: memoryStorage() };
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

// Tipo local mientras @types/multer no esté instalado
interface UploadedFileData {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

@UseGuards(JwtAuthGuard)
@Controller('vehiculos')
export class VehiculosController {
  constructor(private readonly vehiculosService: VehiculosService) {}

  /**
   * POST /vehiculos
   * Crea un vehículo. Acepta JSON puro (sin imagen).
   * Para subir la imagen usa POST /vehiculos/:id/imagen después de crear.
   */
  @Post()
  create(
    @Body() createVehiculoDto: CreateVehiculoDto,
    @CurrentUser() currentUser: Usuario & { empresa: any },
  ) {
    return this.vehiculosService.create(createVehiculoDto, currentUser);
  }

  @Get()
  findAll(@CurrentUser() currentUser: Usuario & { empresa: any }) {
    return this.vehiculosService.findAll(currentUser);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser() currentUser: Usuario & { empresa: any },
  ) {
    return this.vehiculosService.findOne(id, currentUser);
  }

  /**
   * PATCH /vehiculos/:id
   * Actualiza los datos del vehículo. Acepta JSON puro.
   * Para reemplazar la imagen usa POST /vehiculos/:id/imagen.
   */
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateVehiculoDto: UpdateVehiculoDto,
    @CurrentUser() currentUser: Usuario & { empresa: any },
  ) {
    return this.vehiculosService.update(id, updateVehiculoDto, currentUser);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser() currentUser: Usuario & { empresa: any },
  ) {
    return this.vehiculosService.remove(id, currentUser);
  }

  /**
   * POST /vehiculos/:id/imagen
   * Sube o reemplaza la foto del vehículo en Supabase Storage.
   * Acepta multipart/form-data con campo "imagen" (jpg/png/webp/heic, máx 10 MB).
   * La imagen se comprime automáticamente a WebP 800px antes de guardarla.
   */
  @Post(':id/imagen')
  @UseInterceptors(FileInterceptor('imagen', multerMemory))
  uploadImagen(
    @Param('id') id: string,
    @CurrentUser() currentUser: Usuario & { empresa: any },
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_FILE_SIZE }),
          new FileTypeValidator({ fileType: /image\/(jpeg|jpg|png|webp|heic)/ }),
        ],
        fileIsRequired: true,
      }),
    )
    imagen: UploadedFileData,
  ) {
    return this.vehiculosService.uploadImagen(id, currentUser, imagen.buffer);
  }
}
