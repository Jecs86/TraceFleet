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
import { CombustibleService } from './combustible.service';
import { CreateCombustibleDto } from './dto/create-combustible.dto';
import { UpdateCombustibleDto } from './dto/update-combustible.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { Usuario } from '../generated/prisma/client';

@UseGuards(JwtAuthGuard)
@Controller('combustible')
export class CombustibleController {
  constructor(private readonly combustibleService: CombustibleService) {}

  @Post()
  create(
    @Body() createCombustibleDto: CreateCombustibleDto,
    @CurrentUser() currentUser: Usuario & { empresa: any },
  ) {
    return this.combustibleService.create(createCombustibleDto, currentUser);
  }

  @Get()
  findAll(@CurrentUser() currentUser: Usuario & { empresa: any }) {
    return this.combustibleService.findAll(currentUser);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser() currentUser: Usuario & { empresa: any },
  ) {
    return this.combustibleService.findOne(id, currentUser);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCombustibleDto: UpdateCombustibleDto,
    @CurrentUser() currentUser: Usuario & { empresa: any },
  ) {
    return this.combustibleService.update(
      id,
      updateCombustibleDto,
      currentUser,
    );
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser() currentUser: Usuario & { empresa: any },
  ) {
    return this.combustibleService.remove(id, currentUser);
  }
}
