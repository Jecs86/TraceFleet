import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CombustibleService } from './combustible.service';
import { CreateCombustibleDto } from './dto/create-combustible.dto';
import { UpdateCombustibleDto } from './dto/update-combustible.dto';

@Controller('combustible')
export class CombustibleController {
  constructor(private readonly combustibleService: CombustibleService) {}

  @Post()
  create(@Body() createCombustibleDto: CreateCombustibleDto) {
    return this.combustibleService.create(createCombustibleDto);
  }

  @Get()
  findAll() {
    return this.combustibleService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.combustibleService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCombustibleDto: UpdateCombustibleDto) {
    return this.combustibleService.update(+id, updateCombustibleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.combustibleService.remove(+id);
  }
}
