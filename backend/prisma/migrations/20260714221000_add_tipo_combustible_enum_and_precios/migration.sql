/*
  Warnings:

  - Changed the type of `tipoCombustible` on the `RegistroCombustible` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "TipoCombustible" AS ENUM ('ECO', 'SUPER', 'DIESEL');

-- AlterTable
ALTER TABLE "RegistroCombustible" ADD COLUMN     "precioPorGalon" DOUBLE PRECISION,
DROP COLUMN "tipoCombustible",
ADD COLUMN     "tipoCombustible" "TipoCombustible" NOT NULL;

-- CreateTable
CREATE TABLE "PrecioCombustible" (
    "id" TEXT NOT NULL,
    "tipo" "TipoCombustible" NOT NULL,
    "precioPorGalon" DOUBLE PRECISION NOT NULL,
    "actualizadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrecioCombustible_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PrecioCombustible_tipo_key" ON "PrecioCombustible"("tipo");
