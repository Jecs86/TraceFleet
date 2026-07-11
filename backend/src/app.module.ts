import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { EmpresasModule } from './empresas/empresas.module';
import { AuthModule } from './auth/auth.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { VehiculosModule } from './vehiculos/vehiculos.module';
import { DocumentosVehiculoModule } from './documentos-vehiculo/documentos-vehiculo.module';
import { ViajesModule } from './viajes/viajes.module';
import { CombustibleModule } from './combustible/combustible.module';
import { MantenimientosModule } from './mantenimientos/mantenimientos.module';
import { GastosModule } from './gastos/gastos.module';
import { RolesGuard } from './auth/roles.guard';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    EmpresasModule,
    UsuariosModule,
    VehiculosModule,
    DocumentosVehiculoModule,
    ViajesModule,
    CombustibleModule,
    GastosModule,
    MantenimientosModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
