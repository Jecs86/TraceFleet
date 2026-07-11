import { Module } from '@nestjs/common';
import { DocumentosVehiculoService } from './documentos-vehiculo.service';
import { DocumentosVehiculoController } from './documentos-vehiculo.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DocumentosVehiculoController],
  providers: [DocumentosVehiculoService],
})
export class DocumentosVehiculoModule {}
