import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { EmpresasModule } from './empresas/empresas.module';
import { AuthModule } from './auth/auth.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { VehiculosModule } from './vehiculos/vehiculos.module';
import { ViajesModule } from './viajes/viajes.module';
import { CombustibleModule } from './combustible/combustible.module';
import { MantenimientosModule } from './mantenimientos/mantenimientos.module';
import { GastosModule } from './gastos/gastos.module';

@Module({
  imports: [PrismaModule, EmpresasModule, AuthModule, UsuariosModule, VehiculosModule, ViajesModule, CombustibleModule, MantenimientosModule, GastosModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
