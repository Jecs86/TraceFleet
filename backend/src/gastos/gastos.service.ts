import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RolUsuario, Usuario } from '../generated/prisma/client';
import { CreateGastoDto } from './dto/create-gasto.dto';
import { UpdateGastoDto } from './dto/update-gasto.dto';

type AuthUser = Usuario & { empresa: any };

@Injectable()
export class GastosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createGastoDto: CreateGastoDto, currentUser: AuthUser) {
    const empresaId = currentUser.empresaId!;
    const isAdmin = currentUser.rol === RolUsuario.ADMIN;

    const vehiculo = await this.prisma.vehiculo.findUnique({
      where: { id: createGastoDto.vehiculoId },
    });
    if (!vehiculo || (!isAdmin && vehiculo.empresaId !== empresaId)) {
      throw new ForbiddenException(
        'El vehículo no existe o no pertenece a tu empresa',
      );
    }

    const chofer = await this.prisma.usuario.findUnique({
      where: { id: createGastoDto.choferId },
    });
    if (!chofer || (!isAdmin && chofer.empresaId !== empresaId)) {
      throw new ForbiddenException(
        'El chofer no existe o no pertenece a tu empresa',
      );
    }

    if (createGastoDto.viajeId) {
      const viaje = await this.prisma.viaje.findUnique({
        where: { id: createGastoDto.viajeId },
      });
      if (!viaje || (!isAdmin && viaje.empresaId !== empresaId)) {
        throw new ForbiddenException(
          'El viaje no existe o no pertenece a tu empresa',
        );
      }
    }

    return this.prisma.gastoExtra.create({
      data: {
        ...createGastoDto,
        fecha: createGastoDto.fecha
          ? new Date(createGastoDto.fecha)
          : undefined,
      },
    });
  }

  /** ADMIN ve todos los gastos; los demás solo los de su empresa. */
  findAll(currentUser: AuthUser) {
    if (currentUser.rol === RolUsuario.ADMIN) {
      return this.prisma.gastoExtra.findMany({
        include: { vehiculo: true, chofer: true, viaje: true },
      });
    }
    return this.prisma.gastoExtra.findMany({
      where: { vehiculo: { empresaId: currentUser.empresaId! } },
      include: { vehiculo: true, chofer: true, viaje: true },
    });
  }

  async findOne(id: string, currentUser: AuthUser) {
    const gasto = await this.prisma.gastoExtra.findUnique({
      where: { id },
      include: { vehiculo: true, chofer: true, viaje: true },
    });

    if (!gasto) {
      throw new NotFoundException(`GastoExtra #${id} no encontrado`);
    }

    if (
      currentUser.rol !== RolUsuario.ADMIN &&
      gasto.vehiculo.empresaId !== currentUser.empresaId
    ) {
      throw new ForbiddenException('No tienes acceso a este gasto');
    }

    return gasto;
  }

  async update(
    id: string,
    updateGastoDto: UpdateGastoDto,
    currentUser: AuthUser,
  ) {
    await this.findOne(id, currentUser);
    const isAdmin = currentUser.rol === RolUsuario.ADMIN;
    const empresaId = currentUser.empresaId!;

    if (updateGastoDto.vehiculoId) {
      const vehiculo = await this.prisma.vehiculo.findUnique({
        where: { id: updateGastoDto.vehiculoId },
      });
      if (!vehiculo || (!isAdmin && vehiculo.empresaId !== empresaId)) {
        throw new ForbiddenException(
          'El vehículo no existe o no pertenece a tu empresa',
        );
      }
    }

    if (updateGastoDto.choferId) {
      const chofer = await this.prisma.usuario.findUnique({
        where: { id: updateGastoDto.choferId },
      });
      if (!chofer || (!isAdmin && chofer.empresaId !== empresaId)) {
        throw new ForbiddenException(
          'El chofer no existe o no pertenece a tu empresa',
        );
      }
    }

    return this.prisma.gastoExtra.update({
      where: { id },
      data: {
        ...updateGastoDto,
        fecha: updateGastoDto.fecha
          ? new Date(updateGastoDto.fecha)
          : undefined,
      },
    });
  }

  async remove(id: string, currentUser: AuthUser) {
    await this.findOne(id, currentUser);
    return this.prisma.gastoExtra.delete({ where: { id } });
  }
}
