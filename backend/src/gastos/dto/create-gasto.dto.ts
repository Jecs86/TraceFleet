import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateGastoDto {
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

  @IsNotEmpty()
  @IsString()
  categoria: string;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  monto: number;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  comprobanteUrl?: string;
}
