import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateVehiculoDto {
  @IsNotEmpty()
  @IsString()
  placa: string;

  @IsNotEmpty()
  @IsString()
  tipo: string;

  @IsOptional()
  @IsString()
  marca?: string;

  @IsOptional()
  @IsBoolean()
  estadoOperativo?: boolean;

  /**
   * Solo requerido cuando el usuario autenticado es ADMIN.
   * GERENTE y CHOFER siempre crean vehículos en su propia empresa.
   */
  @IsOptional()
  @IsUUID()
  empresaId?: string;
}
