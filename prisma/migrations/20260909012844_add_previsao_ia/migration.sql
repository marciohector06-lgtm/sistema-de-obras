-- AlterTable
ALTER TABLE "Obra" ADD COLUMN     "previsaoAtualizadaEm" TIMESTAMP(3),
ADD COLUMN     "previsaoCusto" DECIMAL(12,2),
ADD COLUMN     "previsaoJustificativa" TEXT;
