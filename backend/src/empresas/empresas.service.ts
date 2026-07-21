import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RolUsuario, Usuario } from '../generated/prisma/client';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';

type AuthUser = Usuario & { empresa: any };

@Injectable()
export class EmpresasService {
  constructor(private readonly prisma: PrismaService) {}

  create(createEmpresaDto: CreateEmpresaDto) {
    return this.prisma.empresa.create({ data: createEmpresaDto });
  }

  /** ADMIN ve todas las empresas; los demás solo la suya. */
  findAll(currentUser: AuthUser) {
    if (currentUser.rol === RolUsuario.ADMIN) {
      return this.prisma.empresa.findMany();
    }
    return this.prisma.empresa.findMany({
      where: { id: currentUser.empresaId! },
    });
  }

  async findOne(id: string, currentUser: AuthUser) {
    const empresa = await this.prisma.empresa.findUnique({ where: { id } });

    if (!empresa) {
      throw new NotFoundException(`Empresa #${id} no encontrada`);
    }

    if (
      currentUser.rol !== RolUsuario.ADMIN &&
      empresa.id !== currentUser.empresaId
    ) {
      throw new ForbiddenException('No tienes acceso a esta empresa');
    }

    return empresa;
  }

  async update(
    id: string,
    updateEmpresaDto: UpdateEmpresaDto,
    currentUser: AuthUser,
  ) {
    await this.findOne(id, currentUser);
    return this.prisma.empresa.update({
      where: { id },
      data: updateEmpresaDto,
    });
  }

  async remove(id: string, currentUser: AuthUser) {
    await this.findOne(id, currentUser);
    return this.prisma.empresa.delete({ where: { id } });
  }
}
