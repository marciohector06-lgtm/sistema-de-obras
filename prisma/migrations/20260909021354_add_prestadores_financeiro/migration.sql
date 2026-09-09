-- CreateEnum
CREATE TYPE "MovimentoTipo" AS ENUM ('ENTRADA', 'SAIDA');

-- AlterTable
ALTER TABLE "Pagamento" ADD COLUMN     "prestadorId" TEXT;

-- CreateTable
CREATE TABLE "Prestador" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "documento" TEXT,
    "chavePix" TEXT,
    "categoria" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prestador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContratoPrestador" (
    "id" TEXT NOT NULL,
    "prestadorId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "arquivo" TEXT,
    "valor" DECIMAL(12,2),
    "dataAssin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContratoPrestador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovimentoFinanceiro" (
    "id" TEXT NOT NULL,
    "tipo" "MovimentoTipo" NOT NULL,
    "descricao" TEXT NOT NULL,
    "valor" DECIMAL(12,2) NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "categoria" TEXT,
    "obraId" TEXT,
    "prestadorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MovimentoFinanceiro_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Pagamento" ADD CONSTRAINT "Pagamento_prestadorId_fkey" FOREIGN KEY ("prestadorId") REFERENCES "Prestador"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContratoPrestador" ADD CONSTRAINT "ContratoPrestador_prestadorId_fkey" FOREIGN KEY ("prestadorId") REFERENCES "Prestador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimentoFinanceiro" ADD CONSTRAINT "MovimentoFinanceiro_obraId_fkey" FOREIGN KEY ("obraId") REFERENCES "Obra"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimentoFinanceiro" ADD CONSTRAINT "MovimentoFinanceiro_prestadorId_fkey" FOREIGN KEY ("prestadorId") REFERENCES "Prestador"("id") ON DELETE SET NULL ON UPDATE CASCADE;
