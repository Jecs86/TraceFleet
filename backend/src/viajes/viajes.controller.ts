import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ViajesService } from './viajes.service';
import { CreateViajeDto } from './dto/create-viaje.dto';
import { UpdateViajeDto } from './dto/update-viaje.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { Usuario } from '../generated/prisma/client';

@UseGuards(JwtAuthGuard)
@Controller('viajes')
export class ViajesController {
  constructor(private readonly viajesService: ViajesService) {}

  @Post()
  create(
    @Body() createViajeDto: CreateViajeDto,
    @CurrentUser() currentUser: Usuario & { empresa: any },
  ) {
    return this.viajesService.create(createViajeDto, currentUser);
  }

  @Get()
  findAll(@CurrentUser() currentUser: Usuario & { empresa: any }) {
    return this.viajesService.findAll(currentUser);
  }

  /**
   * GET /viajes/liquidaciones
   * Lista todas las liquidaciones finalizadas de la empresa.
   * Ruta estática — debe ir ANTES de /:id para que NestJS no la interprete como parámetro.
   */
  @Get('liquidaciones')
  findAllLiquidaciones(@CurrentUser() currentUser: Usuario & { empresa: any }) {
    return this.viajesService.findAllLiquidaciones(currentUser);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser() currentUser: Usuario & { empresa: any },
  ) {
    return this.viajesService.findOne(id, currentUser);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateViajeDto: UpdateViajeDto,
    @CurrentUser() currentUser: Usuario & { empresa: any },
  ) {
    return this.viajesService.update(id, updateViajeDto, currentUser);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser() currentUser: Usuario & { empresa: any },
  ) {
    return this.viajesService.remove(id, currentUser);
  }

  /**
   * POST /viajes/:id/finalizar
   * Cierra financieramente el viaje: marca estado=FINALIZADO y crea la LiquidacionViaje.
   */
  @Post(':id/finalizar')
  finalizar(
    @Param('id') id: string,
    @CurrentUser() currentUser: Usuario & { empresa: any },
  ) {
    return this.viajesService.finalizarViaje(id, currentUser);
  }

  /**
   * GET /viajes/:id/liquidacion
   * Devuelve la liquidación de un viaje específico con el detalle completo:
   * totales, discrepancias, KPIs, y todos los registros de combustible y gastos del viaje.
   */
  @Get(':id/liquidacion')
  findLiquidacion(
    @Param('id') id: string,
    @CurrentUser() currentUser: Usuario & { empresa: any },
  ) {
    return this.viajesService.findLiquidacionByViaje(id, currentUser);
  }
}
