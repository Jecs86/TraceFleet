import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateViajeDto {
  @IsNotEmpty()
  @IsUUID()
  vehiculoId: string;

  @IsNotEmpty()
  @IsUUID()
  choferId: string;

  @IsNotEmpty()
  @IsString()
  origen: string;

  @IsNotEmpty()
  @IsString()
  destino: string;

  @IsOptional()
  @IsDateString()
  fechaSalida?: string;

  @IsOptional()
  @IsDateString()
  fechaLlegada?: string;

  @IsOptional()
  @IsString()
  estado?: string;

  @IsOptional()
  @IsString()
  tipoCarga?: string;

  @IsOptional()
  @IsNumber()
  cantidadCarga?: number;

  @IsOptional()
  @IsString()
  unidadMedida?: string;

  /** Ingreso por flete / servicio que paga el cliente por este viaje. */
  @IsOptional()
  @IsNumber()
  @IsPositive()
  ingresoServicio?: number;
}
