import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RolUsuario, Usuario } from '../generated/prisma/client';
import { CreateDocumentoVehiculoDto } from './dto/create-documento-vehiculo.dto';
import { UpdateDocumentoVehiculoDto } from './dto/update-documento-vehiculo.dto';

type AuthUser = Usuario & { empresa: any };

@Injectable()
export class DocumentosVehiculoService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreateDocumentoVehiculoDto, currentUser: AuthUser) {
    const vehiculo = await this.prisma.vehiculo.findUnique({
      where: { id: createDto.vehiculoId },
    });

    if (
      !vehiculo ||
      (currentUser.rol !== RolUsuario.ADMIN &&
        vehiculo.empresaId !== currentUser.empresaId)
    ) {
      throw new ForbiddenException(
        'El vehículo no existe o no pertenece a tu empresa',
      );
    }

    return this.prisma.documentoVehiculo.create({
      data: {
        ...createDto,
        fechaEmision: createDto.fechaEmision
          ? new Date(createDto.fechaEmision)
          : undefined,
        fechaExpiracion: createDto.fechaExpiracion
          ? new Date(createDto.fechaExpiracion)
          : undefined,
      },
    });
  }

  /** ADMIN ve todos los documentos; los demás solo los de su empresa. */
  findAll(currentUser: AuthUser) {
    if (currentUser.rol === RolUsuario.ADMIN) {
      return this.prisma.documentoVehiculo.findMany({
        include: { vehiculo: true },
      });
    }
    return this.prisma.documentoVehiculo.findMany({
      where: { vehiculo: { empresaId: currentUser.empresaId! } },
      include: { vehiculo: true },
    });
  }

  async findOne(id: string, currentUser: AuthUser) {
    const documento = await this.prisma.documentoVehiculo.findUnique({
      where: { id },
      include: { vehiculo: true },
    });

    if (!documento) {
      throw new NotFoundException(`DocumentoVehiculo #${id} no encontrado`);
    }

    if (
      currentUser.rol !== RolUsuario.ADMIN &&
      documento.vehiculo.empresaId !== currentUser.empresaId
    ) {
      throw new ForbiddenException('No tienes acceso a este documento');
    }

    return documento;
  }

  async update(id: string, updateDto: UpdateDocumentoVehiculoDto, currentUser: AuthUser) {
    await this.findOne(id, currentUser);

    if (updateDto.vehiculoId) {
      const vehiculo = await this.prisma.vehiculo.findUnique({
        where: { id: updateDto.vehiculoId },
      });
      if (
        !vehiculo ||
        (currentUser.rol !== RolUsuario.ADMIN &&
          vehiculo.empresaId !== currentUser.empresaId)
      ) {
        throw new ForbiddenException(
          'El vehículo no existe o no pertenece a tu empresa',
        );
      }
    }

    return this.prisma.documentoVehiculo.update({
      where: { id },
      data: {
        ...updateDto,
        fechaEmision: updateDto.fechaEmision
          ? new Date(updateDto.fechaEmision)
          : undefined,
        fechaExpiracion: updateDto.fechaExpiracion
          ? new Date(updateDto.fechaExpiracion)
          : undefined,
      },
    });
  }

  async remove(id: string, currentUser: AuthUser) {
    await this.findOne(id, currentUser);
    return this.prisma.documentoVehiculo.delete({ where: { id } });
  }
}
