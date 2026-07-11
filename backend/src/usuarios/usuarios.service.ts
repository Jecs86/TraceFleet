import 'dotenv/config';
import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RolUsuario, Usuario } from '../generated/prisma/client';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

type AuthUser = Usuario & { empresa: any };

@Injectable()
export class UsuariosService {
  constructor(private readonly prisma: PrismaService) {}

  create(createUsuarioDto: CreateUsuarioDto, currentUser: AuthUser) {
    return this.prisma.usuario.create({
      data: {
        ...createUsuarioDto,
        empresaId: currentUser.empresaId!,
      },
    });
  }

  /** ADMIN ve todos los usuarios; los demás solo los de su empresa. */
  findAll(currentUser: AuthUser) {
    if (currentUser.rol === RolUsuario.ADMIN) {
      return this.prisma.usuario.findMany({ include: { empresa: true } });
    }
    return this.prisma.usuario.findMany({
      where: { empresaId: currentUser.empresaId! },
    });
  }

  async findOne(id: string, currentUser: AuthUser) {
    const usuario = await this.prisma.usuario.findUnique({ where: { id } });

    if (!usuario) {
      throw new NotFoundException(`Usuario #${id} no encontrado`);
    }

    if (
      currentUser.rol !== RolUsuario.ADMIN &&
      usuario.empresaId !== currentUser.empresaId
    ) {
      throw new ForbiddenException('No tienes acceso a este usuario');
    }

    return usuario;
  }

  async update(
    id: string,
    updateUsuarioDto: UpdateUsuarioDto,
    currentUser: AuthUser,
  ) {
    await this.findOne(id, currentUser);
    return this.prisma.usuario.update({ where: { id }, data: updateUsuarioDto });
  }

  /**
   * Elimina el usuario de la BD local Y de Supabase Auth.
   * Si la eliminación en Supabase falla lanza error para no dejar datos inconsistentes.
   */
  async remove(id: string, currentUser: AuthUser) {
    const usuario = await this.findOne(id, currentUser);

    // 1. Eliminar en Supabase Auth primero (usa el authId que enlaza ambos sistemas)
    await this.deleteFromSupabaseAuth(usuario.authId);

    // 2. Eliminar en la BD local
    return this.prisma.usuario.delete({ where: { id } });
  }

  private async deleteFromSupabaseAuth(authId: string): Promise<void> {
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      throw new InternalServerErrorException(
        'SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY no están configuradas',
      );
    }

    const res = await fetch(
      `${supabaseUrl}/auth/v1/admin/users/${authId}`,
      {
        method: 'DELETE',
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
        },
      },
    );

    // 200 o 204 = éxito; 404 = ya no existía en Supabase (lo consideramos OK)
    if (!res.ok && res.status !== 404) {
      const body = await res.text();
      throw new InternalServerErrorException(
        `No se pudo eliminar el usuario de Supabase Auth (${res.status}): ${body}`,
      );
    }
  }
}
