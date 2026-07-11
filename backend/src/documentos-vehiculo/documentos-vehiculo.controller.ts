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
import { DocumentosVehiculoService } from './documentos-vehiculo.service';
import { CreateDocumentoVehiculoDto } from './dto/create-documento-vehiculo.dto';
import { UpdateDocumentoVehiculoDto } from './dto/update-documento-vehiculo.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { Usuario } from '../generated/prisma/client';

@UseGuards(JwtAuthGuard)
@Controller('documentos-vehiculo')
export class DocumentosVehiculoController {
  constructor(
    private readonly documentosVehiculoService: DocumentosVehiculoService,
  ) {}

  @Post()
  create(
    @Body() createDto: CreateDocumentoVehiculoDto,
    @CurrentUser() currentUser: Usuario & { empresa: any },
  ) {
    return this.documentosVehiculoService.create(createDto, currentUser);
  }

  @Get()
  findAll(@CurrentUser() currentUser: Usuario & { empresa: any }) {
    return this.documentosVehiculoService.findAll(currentUser);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser() currentUser: Usuario & { empresa: any },
  ) {
    return this.documentosVehiculoService.findOne(id, currentUser);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateDocumentoVehiculoDto,
    @CurrentUser() currentUser: Usuario & { empresa: any },
  ) {
    return this.documentosVehiculoService.update(id, updateDto, currentUser);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser() currentUser: Usuario & { empresa: any },
  ) {
    return this.documentosVehiculoService.remove(id, currentUser);
  }
}
