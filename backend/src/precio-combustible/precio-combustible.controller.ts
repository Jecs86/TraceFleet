import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { PrecioCombustibleService } from './precio-combustible.service';
import { UpsertPrecioCombustibleDto } from './dto/upsert-precio-combustible.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolUsuario, TipoCombustible } from '../generated/prisma/client';

@UseGuards(JwtAuthGuard)
@Controller('precio-combustible')
export class PrecioCombustibleController {
  constructor(private readonly service: PrecioCombustibleService) {}

  /**
   * GET /precio-combustible
   * Todos los roles pueden consultar los precios vigentes.
   */
  @Get()
  findAll() {
    return this.service.findAll();
  }

  /**
   * GET /precio-combustible/:tipo
   * Consulta el precio de un tipo específico (ECO, SUPER, DIESEL).
   */
  @Get(':tipo')
  findOne(@Param('tipo') tipo: string) {
    return this.service.findOne(tipo.toUpperCase() as TipoCombustible);
  }

  /**
   * POST /precio-combustible
   * Crea o actualiza el precio oficial de un tipo de combustible.
   * Solo ADMIN y GERENTE pueden modificar precios.
   */
  @Post()
  @Roles(RolUsuario.ADMIN, RolUsuario.GERENTE)
  upsert(@Body() dto: UpsertPrecioCombustibleDto) {
    return this.service.upsert(dto);
  }
}
