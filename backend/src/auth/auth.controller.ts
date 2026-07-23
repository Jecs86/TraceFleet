import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser } from './current-user.decorator';
import { RolUsuario } from '../generated/prisma/client';
import type { Usuario } from '../generated/prisma/client';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@CurrentUser() user: Usuario) {
    return user;
  }

  @Post('login')
  async login(@Body() body: { correo: string; contrasena: string }) {
    // Agregamos el await aquí
    return await this.authService.login(body.correo, body.contrasena);
  }

  /**
   * Sincroniza un usuario de Supabase Auth con la BD local.
   * Soporta rol ADMIN (sin empresa), GERENTE y CHOFER.
   *
   * Body:
   *   authId    — UUID del usuario en Supabase Auth (auth.users.id)
   *   correo    — email del usuario
   *   nombre    — nombre completo
   *   rol       — ADMIN | GERENTE | CHOFER  (opcional, default GERENTE)
   *   empresaId — UUID de empresa existente  (opcional, solo para GERENTE/CHOFER)
   */
  @Post('setup-user')
  async setupUser(
    @Body()
    body: {
      authId: string;
      correo: string;
      nombre: string;
      rol?: RolUsuario;
      empresaId?: string;
    },
  ) {
    return this.authService.setupTestUser(
      body.authId,
      body.correo,
      body.nombre,
      body.rol,
      body.empresaId,
    );
  }

  /** @deprecated Usa /auth/setup-user */
  @Post('setup-test-user')
  async setupTestUser(
    @Body()
    body: {
      authId: string;
      correo: string;
      nombre: string;
      rol?: RolUsuario;
    },
  ) {
    return this.authService.setupTestUser(
      body.authId,
      body.correo,
      body.nombre,
      body.rol,
    );
  }
}
