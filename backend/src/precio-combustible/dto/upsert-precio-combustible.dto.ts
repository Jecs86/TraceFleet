import { IsEnum, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';
import { TipoCombustible } from '../../generated/prisma/client';

export class UpsertPrecioCombustibleDto {
  @IsNotEmpty()
  @IsEnum(TipoCombustible, {
    message: `tipo debe ser uno de: ${Object.values(TipoCombustible).join(', ')}`,
  })
  tipo: TipoCombustible;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  precioPorGalon: number;
}
