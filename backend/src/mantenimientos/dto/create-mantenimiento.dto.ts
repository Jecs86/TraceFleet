import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateMantenimientoDto {
  @IsNotEmpty()
  @IsUUID()
  vehiculoId: string;

  @IsOptional()
  @IsDateString()
  fecha?: string;

  @IsNotEmpty()
  @IsString()
  tipo: string;

  @IsNotEmpty()
  @IsString()
  descripcion: string;

  @IsOptional()
  @IsString()
  taller?: string;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  costo: number;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  kilometraje: number;

  @IsOptional()
  @IsString()
  facturaUrl?: string;
}
