import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RolUsuario } from '../generated/prisma/client';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async setupTestUser(
    authId: string,
    correo: string,
    nombre: string,
    rol?: RolUsuario,
    empresaId?: string,
  ) {
    if (!authId || !correo || !nombre) {
      throw new BadRequestException(
        'authId, correo y nombre son campos obligatorios',
      );
    }

    // ADMIN users don't need a company — they operate across the whole platform.
    // For everyone else, ensure at least one company exists.
    let resolvedEmpresaId: string | null = empresaId ?? null;

    if (!resolvedEmpresaId && rol !== RolUsuario.ADMIN) {
      let empresa = await this.prisma.empresa.findFirst();
      if (!empresa) {
        empresa = await this.prisma.empresa.create({
          data: {
            nombre: 'Empresa Demo TraceFleet',
            tipoIndustria: 'Logística',
          },
        });
      }
      resolvedEmpresaId = empresa.id;
    }

    // Upsert: update if already exists, create otherwise
    const usuarioExistente = await this.prisma.usuario.findFirst({
      where: {
        OR: [{ authId }, { correo }],
      },
    });

    if (usuarioExistente) {
      return this.prisma.usuario.update({
        where: { id: usuarioExistente.id },
        data: {
          authId,
          correo,
          nombre,
          rol: rol ?? usuarioExistente.rol,
        },
      });
    }

    return this.prisma.usuario.create({
      data: {
        authId,
        correo,
        nombre,
        rol: rol ?? RolUsuario.GERENTE,
        empresaId: resolvedEmpresaId,
      },
    });
  }
}
