import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RolUsuario, Usuario } from '../generated/prisma/client';
import { CreateVehiculoDto } from './dto/create-vehiculo.dto';
import { UpdateVehiculoDto } from './dto/update-vehiculo.dto';

type AuthUser = Usuario & { empresa: any };

@Injectable()
export class VehiculosService {
  constructor(private readonly prisma: PrismaService) {}

  create(createVehiculoDto: CreateVehiculoDto, currentUser: AuthUser) {
    return this.prisma.vehiculo.create({
      data: {
        ...createVehiculoDto,
        empresaId: currentUser.empresaId!,
      },
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

  async update(id: string, updateVehiculoDto: UpdateVehiculoDto, currentUser: AuthUser) {
    await this.findOne(id, currentUser);
    return this.prisma.vehiculo.update({ where: { id }, data: updateVehiculoDto });
  }

  async remove(id: string, currentUser: AuthUser) {
    await this.findOne(id, currentUser);
    return this.prisma.vehiculo.delete({ where: { id } });
  }
}
