import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolUsuario } from '../generated/prisma/client';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<RolUsuario[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Si no hay roles requeridos en el endpoint, dejar pasar
    // (el JwtAuthGuard se encarga de la autenticación)
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    // Si no hay usuario aún (JwtAuthGuard no corrió todavía), dejar pasar
    // El JwtAuthGuard rechazará la petición si el token es inválido
    if (!user) {
      return true;
    }

    // ADMIN bypasses all role restrictions
    if (user.rol === RolUsuario.ADMIN) {
      return true;
    }

    return requiredRoles.some((rol) => user.rol === rol);
  }
}
