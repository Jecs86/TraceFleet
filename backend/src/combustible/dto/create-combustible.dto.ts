import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';

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
  @IsString()
  tipoCombustible: string;

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
