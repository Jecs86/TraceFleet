import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateDocumentoVehiculoDto {
  @IsNotEmpty()
  @IsUUID()
  vehiculoId: string;

  @IsNotEmpty()
  @IsString()
  tipoDocumento: string;

  @IsOptional()
  @IsDateString()
  fechaEmision?: string;

  @IsOptional()
  @IsDateString()
  fechaExpiracion?: string;

  @IsOptional()
  @IsNumber()
  costo?: number;

  @IsOptional()
  @IsString()
  archivoUrl?: string;
}
