import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { VehiculosModule } from './vehiculos/vehiculos.module';
import { CombustibleModule } from './combustible/combustible.module';
import { IncidenciasModule } from './incidencias/incidencias.module';

@Module({
  imports: [AuthModule, UsuariosModule, VehiculosModule, CombustibleModule, IncidenciasModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
