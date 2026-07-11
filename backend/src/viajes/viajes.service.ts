import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RolUsuario, Usuario } from '../generated/prisma/client';
import { CreateViajeDto } from './dto/create-viaje.dto';
import { UpdateViajeDto } from './dto/update-viaje.dto';

type AuthUser = Usuario & { empresa: any };

@Injectable()
export class ViajesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createViajeDto: CreateViajeDto, currentUser: AuthUser) {
    const empresaId = currentUser.empresaId!;

    const vehiculo = await this.prisma.vehiculo.findUnique({
      where: { id: createViajeDto.vehiculoId },
    });
    if (
      !vehiculo ||
      (currentUser.rol !== RolUsuario.ADMIN && vehiculo.empresaId !== empresaId)
    ) {
      throw new ForbiddenException(
        'El vehículo no existe o no pertenece a tu empresa',
      );
    }

    const chofer = await this.prisma.usuario.findUnique({
      where: { id: createViajeDto.choferId },
    });
    if (
      !chofer ||
      (currentUser.rol !== RolUsuario.ADMIN && chofer.empresaId !== empresaId)
    ) {
      throw new ForbiddenException(
        'El chofer no existe o no pertenece a tu empresa',
      );
    }

    // ADMIN uses the vehicle's company for the viaje record
    const viajeEmpresaId =
      currentUser.rol === RolUsuario.ADMIN ? vehiculo.empresaId : empresaId;

    return this.prisma.viaje.create({
      data: {
        ...createViajeDto,
        empresaId: viajeEmpresaId,
        fechaSalida: createViajeDto.fechaSalida
          ? new Date(createViajeDto.fechaSalida)
          : undefined,
        fechaLlegada: createViajeDto.fechaLlegada
          ? new Date(createViajeDto.fechaLlegada)
          : undefined,
      },
    });
  }

  /** ADMIN ve todos los viajes; los demás solo los de su empresa. */
  findAll(currentUser: AuthUser) {
    if (currentUser.rol === RolUsuario.ADMIN) {
      return this.prisma.viaje.findMany({
        include: { vehiculo: true, chofer: true, empresa: true },
      });
    }
    return this.prisma.viaje.findMany({
      where: { empresaId: currentUser.empresaId! },
      include: { vehiculo: true, chofer: true },
    });
  }

  async findOne(id: string, currentUser: AuthUser) {
    const viaje = await this.prisma.viaje.findUnique({
      where: { id },
      include: { vehiculo: true, chofer: true },
    });

    if (!viaje) {
      throw new NotFoundException(`Viaje #${id} no encontrado`);
    }

    if (
      currentUser.rol !== RolUsuario.ADMIN &&
      viaje.empresaId !== currentUser.empresaId
    ) {
      throw new ForbiddenException('No tienes acceso a este viaje');
    }

    return viaje;
  }

  async update(id: string, updateViajeDto: UpdateViajeDto, currentUser: AuthUser) {
    await this.findOne(id, currentUser);
    const empresaId = currentUser.empresaId!;

    if (updateViajeDto.vehiculoId) {
      const vehiculo = await this.prisma.vehiculo.findUnique({
        where: { id: updateViajeDto.vehiculoId },
      });
      if (
        !vehiculo ||
        (currentUser.rol !== RolUsuario.ADMIN && vehiculo.empresaId !== empresaId)
      ) {
        throw new ForbiddenException(
          'El vehículo no existe o no pertenece a tu empresa',
        );
      }
    }

    if (updateViajeDto.choferId) {
      const chofer = await this.prisma.usuario.findUnique({
        where: { id: updateViajeDto.choferId },
      });
      if (
        !chofer ||
        (currentUser.rol !== RolUsuario.ADMIN && chofer.empresaId !== empresaId)
      ) {
        throw new ForbiddenException(
          'El chofer no existe o no pertenece a tu empresa',
        );
      }
    }

    return this.prisma.viaje.update({
      where: { id },
      data: {
        ...updateViajeDto,
        fechaSalida: updateViajeDto.fechaSalida
          ? new Date(updateViajeDto.fechaSalida)
          : undefined,
        fechaLlegada: updateViajeDto.fechaLlegada
          ? new Date(updateViajeDto.fechaLlegada)
          : undefined,
      },
    });
  }

  async remove(id: string, currentUser: AuthUser) {
    await this.findOne(id, currentUser);
    return this.prisma.viaje.delete({ where: { id } });
  }
}
