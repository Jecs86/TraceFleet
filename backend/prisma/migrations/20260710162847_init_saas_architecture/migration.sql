-- CreateEnum
CREATE TYPE "RolUsuario" AS ENUM ('GERENTE', 'CHOFER');

-- CreateTable
CREATE TABLE "Empresa" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipoIndustria" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Empresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "authId" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "rol" "RolUsuario" NOT NULL DEFAULT 'CHOFER',
    "estadoActivo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehiculo" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "placa" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "marca" TEXT,
    "estadoOperativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Vehiculo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentoVehiculo" (
    "id" TEXT NOT NULL,
    "vehiculoId" TEXT NOT NULL,
    "tipoDocumento" TEXT NOT NULL,
    "fechaEmision" TIMESTAMP(3),
    "fechaExpiracion" TIMESTAMP(3),
    "costo" DOUBLE PRECISION,
    "archivoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentoVehiculo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Viaje" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "vehiculoId" TEXT NOT NULL,
    "choferId" TEXT NOT NULL,
    "origen" TEXT NOT NULL,
    "destino" TEXT NOT NULL,
    "fechaSalida" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaLlegada" TIMESTAMP(3),
    "estado" TEXT NOT NULL DEFAULT 'EN_RUTA',
    "tipoCarga" TEXT,
    "cantidadCarga" DOUBLE PRECISION,
    "unidadMedida" TEXT,

    CONSTRAINT "Viaje_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegistroCombustible" (
    "id" TEXT NOT NULL,
    "vehiculoId" TEXT NOT NULL,
    "choferId" TEXT NOT NULL,
    "viajeId" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estacion" TEXT,
    "tipoCombustible" TEXT NOT NULL,
    "galones" DOUBLE PRECISION NOT NULL,
    "costoTotal" DOUBLE PRECISION NOT NULL,
    "distancia" DOUBLE PRECISION NOT NULL,
    "rendimientoCalculado" DOUBLE PRECISION,
    "estado" TEXT NOT NULL DEFAULT 'OK',
    "facturaUrl" TEXT,

    CONSTRAINT "RegistroCombustible_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GastoExtra" (
    "id" TEXT NOT NULL,
    "vehiculoId" TEXT NOT NULL,
    "choferId" TEXT NOT NULL,
    "viajeId" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "categoria" TEXT NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "descripcion" TEXT,
    "comprobanteUrl" TEXT,

    CONSTRAINT "GastoExtra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mantenimiento" (
    "id" TEXT NOT NULL,
    "vehiculoId" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tipo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "taller" TEXT,
    "costo" DOUBLE PRECISION NOT NULL,
    "kilometraje" DOUBLE PRECISION NOT NULL,
    "facturaUrl" TEXT,

    CONSTRAINT "Mantenimiento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_authId_key" ON "Usuario"("authId");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_correo_key" ON "Usuario"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "Vehiculo_placa_key" ON "Vehiculo"("placa");

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehiculo" ADD CONSTRAINT "Vehiculo_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentoVehiculo" ADD CONSTRAINT "DocumentoVehiculo_vehiculoId_fkey" FOREIGN KEY ("vehiculoId") REFERENCES "Vehiculo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Viaje" ADD CONSTRAINT "Viaje_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Viaje" ADD CONSTRAINT "Viaje_vehiculoId_fkey" FOREIGN KEY ("vehiculoId") REFERENCES "Vehiculo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Viaje" ADD CONSTRAINT "Viaje_choferId_fkey" FOREIGN KEY ("choferId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroCombustible" ADD CONSTRAINT "RegistroCombustible_vehiculoId_fkey" FOREIGN KEY ("vehiculoId") REFERENCES "Vehiculo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroCombustible" ADD CONSTRAINT "RegistroCombustible_choferId_fkey" FOREIGN KEY ("choferId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroCombustible" ADD CONSTRAINT "RegistroCombustible_viajeId_fkey" FOREIGN KEY ("viajeId") REFERENCES "Viaje"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GastoExtra" ADD CONSTRAINT "GastoExtra_vehiculoId_fkey" FOREIGN KEY ("vehiculoId") REFERENCES "Vehiculo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GastoExtra" ADD CONSTRAINT "GastoExtra_choferId_fkey" FOREIGN KEY ("choferId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GastoExtra" ADD CONSTRAINT "GastoExtra_viajeId_fkey" FOREIGN KEY ("viajeId") REFERENCES "Viaje"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mantenimiento" ADD CONSTRAINT "Mantenimiento_vehiculoId_fkey" FOREIGN KEY ("vehiculoId") REFERENCES "Vehiculo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
