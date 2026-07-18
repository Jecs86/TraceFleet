-- AlterTable
ALTER TABLE "Viaje" ADD COLUMN     "ingresoServicio" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "LiquidacionViaje" (
    "id" TEXT NOT NULL,
    "viajeId" TEXT NOT NULL,
    "totalCombustibleReal" DOUBLE PRECISION NOT NULL,
    "totalGastosExtra" DOUBLE PRECISION NOT NULL,
    "discrepanciaPrecioCombustible" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discrepanciaGalones" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ahorroMantenimientoEstimado" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "utilidadNetaViaje" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LiquidacionViaje_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LiquidacionViaje_viajeId_key" ON "LiquidacionViaje"("viajeId");

-- AddForeignKey
ALTER TABLE "LiquidacionViaje" ADD CONSTRAINT "LiquidacionViaje_viajeId_fkey" FOREIGN KEY ("viajeId") REFERENCES "Viaje"("id") ON DELETE CASCADE ON UPDATE CASCADE;
