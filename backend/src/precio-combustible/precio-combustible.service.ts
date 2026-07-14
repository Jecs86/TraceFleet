import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TipoCombustible } from '../generated/prisma/client';
import { UpsertPrecioCombustibleDto } from './dto/upsert-precio-combustible.dto';

@Injectable()
export class PrecioCombustibleService {
  constructor(private readonly prisma: PrismaService) {}

  /** Devuelve los precios vigentes de todos los tipos de combustible. */
  findAll() {
    return this.prisma.precioCombustible.findMany({
      orderBy: { tipo: 'asc' },
    });
  }

  /** Devuelve el precio vigente de un tipo específico. */
  async findOne(tipo: TipoCombustible) {
    const precio = await this.prisma.precioCombustible.findUnique({
      where: { tipo },
    });
    if (!precio) {
      throw new NotFoundException(`No hay precio configurado para ${tipo}`);
    }
    return precio;
  }

  /**
   * Crea o actualiza el precio de un tipo de combustible.
   * Usa upsert: si ya existe, lo actualiza; si no, lo crea.
   * Solo ADMIN o GERENTE deberían poder invocar esto (controlado en el guard).
   */
  upsert(dto: UpsertPrecioCombustibleDto) {
    return this.prisma.precioCombustible.upsert({
      where: { tipo: dto.tipo },
      update: { precioPorGalon: dto.precioPorGalon },
      create: { tipo: dto.tipo, precioPorGalon: dto.precioPorGalon },
    });
  }
}
