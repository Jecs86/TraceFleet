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

  @Post('setup-test-user')
  async setupTestUser(
    @Body() body: { authId: string; correo: string; nombre: string; rol?: RolUsuario },
  ) {
    return this.authService.setupTestUser(body.authId, body.correo, body.nombre, body.rol);
  }
}

