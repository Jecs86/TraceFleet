import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';
import { TipoCombustible } from '../../generated/prisma/client';

export class CreateCombustibleDto {
  @IsNotEmpty()
  @IsUUID()
  vehiculoId: string;

  @IsNotEmpty()
  @IsUUID()
  choferId: string;

  @IsOptional()
  @IsUUID()
  viajeId?: string;

  @IsOptional()
  @IsDateString()
  fecha?: string;

  @IsOptional()
  @IsString()
  estacion?: string;

  @IsNotEmpty()
  @IsEnum(TipoCombustible, {
    message: `tipoCombustible debe ser uno de: ${Object.values(TipoCombustible).join(', ')}`,
  })
  tipoCombustible: TipoCombustible;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  galones: number;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  costoTotal: number;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  distancia: number;

  @IsOptional()
  @IsString()
  estado?: string;

  @IsOptional()
  @IsString()
  facturaUrl?: string;
}
