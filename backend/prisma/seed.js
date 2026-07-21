"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const client_1 = require("../src/generated/prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const adapter = new adapter_pg_1.PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new client_1.PrismaClient({ adapter });
async function main() {
    console.log('🌱 Iniciando la siembra de datos de prueba...');
    const empresa = await prisma.empresa.create({
        data: {
            nombre: 'TraceFleet Logística',
            tipoIndustria: 'Carga Pesada',
        },
    });
    await prisma.usuario.create({
        data: {
            authId: 'uuid-auth-admin-jose',
            empresaId: empresa.id,
            nombre: 'José',
            correo: 'admin@tracefleet.com',
            rol: 'ADMIN',
        },
    });
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
//# sourceMappingURL=seed.js.map