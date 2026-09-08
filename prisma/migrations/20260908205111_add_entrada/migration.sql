-- CreateTable
CREATE TABLE "Entrada" (
    "id" TEXT NOT NULL,
    "obraId" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "valor" DECIMAL(12,2) NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "comprovante" TEXT,
    "observacao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Entrada_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Entrada" ADD CONSTRAINT "Entrada_obraId_fkey" FOREIGN KEY ("obraId") REFERENCES "Obra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
