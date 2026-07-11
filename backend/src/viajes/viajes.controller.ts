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
}
