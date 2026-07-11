import { PartialType } from '@nestjs/mapped-types';
import { CreateDocumentoVehiculoDto } from './create-documento-vehiculo.dto';

export class UpdateDocumentoVehiculoDto extends PartialType(
  CreateDocumentoVehiculoDto,
) {}
