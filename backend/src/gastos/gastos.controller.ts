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
import { GastosService } from './gastos.service';
import { CreateGastoDto } from './dto/create-gasto.dto';
import { UpdateGastoDto } from './dto/update-gasto.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { Usuario } from '../generated/prisma/client';

@UseGuards(JwtAuthGuard)
@Controller('gastos')
export class GastosController {
  constructor(private readonly gastosService: GastosService) {}

  @Post()
  create(
    @Body() createGastoDto: CreateGastoDto,
    @CurrentUser() currentUser: Usuario & { empresa: any },
  ) {
    return this.gastosService.create(createGastoDto, currentUser);
  }

  @Get()
  findAll(@CurrentUser() currentUser: Usuario & { empresa: any }) {
    return this.gastosService.findAll(currentUser);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser() currentUser: Usuario & { empresa: any },
  ) {
    return this.gastosService.findOne(id, currentUser);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateGastoDto: UpdateGastoDto,
    @CurrentUser() currentUser: Usuario & { empresa: any },
  ) {
    return this.gastosService.update(id, updateGastoDto, currentUser);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser() currentUser: Usuario & { empresa: any },
  ) {
    return this.gastosService.remove(id, currentUser);
  }
}
