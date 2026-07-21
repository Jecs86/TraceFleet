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
import { MantenimientosService } from './mantenimientos.service';
import { CreateMantenimientoDto } from './dto/create-mantenimiento.dto';
import { UpdateMantenimientoDto } from './dto/update-mantenimiento.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { Usuario } from '../generated/prisma/client';

@UseGuards(JwtAuthGuard)
@Controller('mantenimientos')
export class MantenimientosController {
  constructor(private readonly mantenimientosService: MantenimientosService) {}

  @Post()
  create(
    @Body() createMantenimientoDto: CreateMantenimientoDto,
    @CurrentUser() currentUser: Usuario & { empresa: any },
  ) {
    return this.mantenimientosService.create(
      createMantenimientoDto,
      currentUser,
    );
  }

  @Get()
  findAll(@CurrentUser() currentUser: Usuario & { empresa: any }) {
    return this.mantenimientosService.findAll(currentUser);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser() currentUser: Usuario & { empresa: any },
  ) {
    return this.mantenimientosService.findOne(id, currentUser);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMantenimientoDto: UpdateMantenimientoDto,
    @CurrentUser() currentUser: Usuario & { empresa: any },
  ) {
    return this.mantenimientosService.update(
      id,
      updateMantenimientoDto,
      currentUser,
    );
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser() currentUser: Usuario & { empresa: any },
  ) {
    return this.mantenimientosService.remove(id, currentUser);
  }
}
