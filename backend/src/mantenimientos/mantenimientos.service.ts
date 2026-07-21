import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RolUsuario, Usuario } from '../generated/prisma/client';
import { CreateMantenimientoDto } from './dto/create-mantenimiento.dto';
import { UpdateMantenimientoDto } from './dto/update-mantenimiento.dto';

type AuthUser = Usuario & { empresa: any };

@Injectable()
export class MantenimientosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreateMantenimientoDto, currentUser: AuthUser) {
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

    return this.prisma.mantenimiento.create({
      data: {
        ...createDto,
        fecha: createDto.fecha ? new Date(createDto.fecha) : undefined,
      },
    });
  }

  /** ADMIN ve todos los mantenimientos; los demás solo los de su empresa. */
  findAll(currentUser: AuthUser) {
    if (currentUser.rol === RolUsuario.ADMIN) {
      return this.prisma.mantenimiento.findMany({
        include: { vehiculo: true },
      });
    }
    return this.prisma.mantenimiento.findMany({
      where: { vehiculo: { empresaId: currentUser.empresaId! } },
      include: { vehiculo: true },
    });
  }

  async findOne(id: string, currentUser: AuthUser) {
    const mantenimiento = await this.prisma.mantenimiento.findUnique({
      where: { id },
      include: { vehiculo: true },
    });

    if (!mantenimiento) {
      throw new NotFoundException(`Mantenimiento #${id} no encontrado`);
    }

    if (
      currentUser.rol !== RolUsuario.ADMIN &&
      mantenimiento.vehiculo.empresaId !== currentUser.empresaId
    ) {
      throw new ForbiddenException('No tienes acceso a este mantenimiento');
    }

    return mantenimiento;
  }

  async update(
    id: string,
    updateDto: UpdateMantenimientoDto,
    currentUser: AuthUser,
  ) {
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

    return this.prisma.mantenimiento.update({
      where: { id },
      data: {
        ...updateDto,
        fecha: updateDto.fecha ? new Date(updateDto.fecha) : undefined,
      },
    });
  }

  async remove(id: string, currentUser: AuthUser) {
    await this.findOne(id, currentUser);
    return this.prisma.mantenimiento.delete({ where: { id } });
  }
}
