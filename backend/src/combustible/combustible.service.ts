import { Injectable } from '@nestjs/common';
import { CreateCombustibleDto } from './dto/create-combustible.dto';
import { UpdateCombustibleDto } from './dto/update-combustible.dto';

@Injectable()
export class CombustibleService {
  create(createCombustibleDto: CreateCombustibleDto) {
    return 'This action adds a new combustible';
  }

  findAll() {
    return `This action returns all combustible`;
  }

  findOne(id: number) {
    return `This action returns a #${id} combustible`;
  }

  update(id: number, updateCombustibleDto: UpdateCombustibleDto) {
    return `This action updates a #${id} combustible`;
  }

  remove(id: number) {
    return `This action removes a #${id} combustible`;
  }
}
