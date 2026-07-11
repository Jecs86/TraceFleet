import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RolUsuario } from '../generated/prisma/client';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async setupTestUser(authId: string, correo: string, nombre: string, rol?: RolUsuario) {
    if (!authId || !correo || !nombre) {
      throw new BadRequestException('authId, correo y nombre son campos obligatorios');
    }

    // 1. Asegurar la existencia de al menos una empresa
    let empresa = await this.prisma.empresa.findFirst();
    if (!empresa) {
      empresa = await this.prisma.empresa.create({
        data: {
          nombre: 'Empresa Demo TraceFleet',
          tipoIndustria: 'Logística',
        },
      });
    }

    // 2. Verificar si el usuario ya existe
    const usuarioExistente = await this.prisma.usuario.findFirst({
      where: {
        OR: [
          { authId },
          { correo },
        ],
      },
    });

    if (usuarioExistente) {
      // Si existe, actualizamos su authId y correo en caso de que hayan cambiado
      return this.prisma.usuario.update({
        where: { id: usuarioExistente.id },
        data: {
          authId,
          correo,
          nombre,
          rol: rol || usuarioExistente.rol,
        },
      });
    }

    // 3. Crear el nuevo usuario
    return this.prisma.usuario.create({
      data: {
        authId,
        correo,
        nombre,
        rol: rol || 'GERENTE',
        empresaId: empresa.id,
      },
    });
  }
}

