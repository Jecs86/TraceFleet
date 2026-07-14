import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RolUsuario, Usuario } from '../generated/prisma/client';
import { CreateVehiculoDto } from './dto/create-vehiculo.dto';
import { UpdateVehiculoDto } from './dto/update-vehiculo.dto';
import { SupabaseStorageService } from '../storage/supabase-storage.service';

type AuthUser = Usuario & { empresa: any };

@Injectable()
export class VehiculosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: SupabaseStorageService,
  ) {}

  /** Crea el vehículo sin imagen. La imagen se sube por separado con uploadImagen(). */
  create(createVehiculoDto: CreateVehiculoDto, currentUser: AuthUser) {
    // ADMIN puede crear vehículos para cualquier empresa pasando empresaId en el body.
    // GERENTE/CHOFER siempre crean en su propia empresa.
    const empresaId =
      currentUser.rol === RolUsuario.ADMIN
        ? (createVehiculoDto as any).empresaId ??
          (() => {
            throw new BadRequestException('ADMIN debe especificar empresaId');
          })()
        : currentUser.empresaId!;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { empresaId: _ignored, ...rest } = createVehiculoDto as any;

    return this.prisma.vehiculo.create({
      data: { ...rest, empresaId },
    });
  }

  /** ADMIN ve todos los vehículos; los demás solo los de su empresa. */
  findAll(currentUser: AuthUser) {
    if (currentUser.rol === RolUsuario.ADMIN) {
      return this.prisma.vehiculo.findMany({ include: { empresa: true } });
    }
    return this.prisma.vehiculo.findMany({
      where: { empresaId: currentUser.empresaId! },
    });
  }

  async findOne(id: string, currentUser: AuthUser) {
    const vehiculo = await this.prisma.vehiculo.findUnique({ where: { id } });

    if (!vehiculo) {
      throw new NotFoundException(`Vehículo #${id} no encontrado`);
    }

    if (
      currentUser.rol !== RolUsuario.ADMIN &&
      vehiculo.empresaId !== currentUser.empresaId
    ) {
      throw new ForbiddenException('No tienes acceso a este vehículo');
    }

    return vehiculo;
  }

  async update(
    id: string,
    updateVehiculoDto: UpdateVehiculoDto,
    currentUser: AuthUser,
  ) {
    await this.findOne(id, currentUser);
    return this.prisma.vehiculo.update({
      where: { id },
      data: updateVehiculoDto,
    });
  }

  async remove(id: string, currentUser: AuthUser) {
    const vehiculo = await this.findOne(id, currentUser);

    // Eliminar imagen del storage si existe
    if (vehiculo.imagenUrl) {
      await this.storage.deleteImagenVehiculo(vehiculo.placa);
    }

    return this.prisma.vehiculo.delete({ where: { id } });
  }

  /**
   * POST /vehiculos/:id/imagen
   * Comprime y sube la imagen a Storage, luego guarda la URL pública en BD.
   * Sobreescribe la imagen anterior si ya existía.
   */
  async uploadImagen(id: string, currentUser: AuthUser, buffer: Buffer) {
    const vehiculo = await this.findOne(id, currentUser);

    const imagenUrl = await this.storage.uploadImagenVehiculo(
      vehiculo.placa,
      buffer,
    );

    return this.prisma.vehiculo.update({
      where: { id },
      data: { imagenUrl },
    });
  }
}
