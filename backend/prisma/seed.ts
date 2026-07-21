import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Iniciando la siembra de datos de prueba...');

  // 1. Crear Empresa
  const empresa = await prisma.empresa.create({
    data: {
      nombre: 'TraceFleet Logística',
      tipoIndustria: 'Carga Pesada',
    },
  });

  // 2. Crear Usuario Administrador (Tú)
  await prisma.usuario.create({
    data: {
      authId: 'uuid-auth-admin-jose',
      empresaId: empresa.id,
      nombre: 'José',
      correo: 'admin@tracefleet.com',
      rol: 'ADMIN',
    },
  });

  // 3. Crear Vehículos
  const vehiculoA01 = await prisma.vehiculo.create({
    data: {
      empresaId: empresa.id,
      placa: '#A01',
      tipo: 'Furgón',
      marca: 'Volvo',
      estadoOperativo: true,
    },
  });

  await prisma.vehiculo.create({
    data: {
      empresaId: empresa.id,
      placa: '#A06',
      tipo: 'Camión',
      marca: 'Hino',
      estadoOperativo: true,
    },
  });

  await prisma.vehiculo.create({
    data: {
      empresaId: empresa.id,
      placa: '#A12',
      tipo: 'Tanquero',
      marca: 'Mercedes',
      estadoOperativo: false,
    },
  });

  // 4. Crear Choferes
  const choferBryan = await prisma.usuario.create({
    data: {
      authId: 'uuid-bryan',
      empresaId: empresa.id,
      nombre: 'Bryan S.',
      correo: 'bryan@tracefleet.com',
      rol: 'CHOFER',
    },
  });

  await prisma.usuario.create({
    data: {
      authId: 'uuid-luis',
      empresaId: empresa.id,
      nombre: 'Luis V.',
      correo: 'luis@tracefleet.com',
      rol: 'CHOFER',
    },
  });

  // 5. Crear un Viaje
  const viajeBryan = await prisma.viaje.create({
    data: {
      empresaId: empresa.id,
      vehiculoId: vehiculoA01.id,
      choferId: choferBryan.id,
      origen: 'Guayaquil',
      destino: 'Quito',
      estado: 'EN_RUTA',
    },
  });

  // 6. Crear Registro de Combustible
  await prisma.registroCombustible.create({
    data: {
      vehiculoId: vehiculoA01.id,
      choferId: choferBryan.id,
      viajeId: viajeBryan.id,
      tipoCombustible: 'DIESEL',
      galones: 120,
      costoTotal: 350,
      distancia: 480,
      estado: 'ANOMALIA',
    },
  });

  console.log('✅ ¡Base de datos sembrada con éxito!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
