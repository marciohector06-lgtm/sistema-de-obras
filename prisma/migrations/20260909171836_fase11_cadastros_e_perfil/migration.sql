/*
  Warnings:

  - The `categoria` column on the `Prestador` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "TipoObra" AS ENUM ('RESIDENCIAL', 'COMERCIAL', 'REFORMA', 'INSTITUCIONAL', 'OUTRO');

-- CreateEnum
CREATE TYPE "PrestadorCategoria" AS ENUM ('MAO_DE_OBRA_GERAL', 'ELETRICA', 'HIDRAULICA', 'PINTURA', 'ALVENARIA', 'ACABAMENTO', 'OUTRO');

-- AlterTable
ALTER TABLE "Obra" ADD COLUMN     "cidade" TEXT,
ADD COLUMN     "responsavelTecnico" TEXT,
ADD COLUMN     "tipo" "TipoObra";

-- AlterTable
ALTER TABLE "Prestador" ADD COLUMN     "email" TEXT,
ADD COLUMN     "telefone" TEXT,
DROP COLUMN "categoria",
ADD COLUMN     "categoria" "PrestadorCategoria";

-- AlterTable
ALTER TABLE "Proposta" ADD COLUMN     "condicoesPagamento" TEXT,
ADD COLUMN     "validade" TIMESTAMP(3);
