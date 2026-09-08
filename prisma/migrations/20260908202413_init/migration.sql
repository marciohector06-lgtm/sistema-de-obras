-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'GESTOR', 'ENGENHEIRO', 'VIEWER');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('PENDING', 'ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "ObraStatus" AS ENUM ('PLANEJAMENTO', 'EM_ANDAMENTO', 'PAUSADA', 'CONCLUIDA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "Prioridade" AS ENUM ('BAIXA', 'MEDIA', 'ALTA', 'CRITICA');

-- CreateEnum
CREATE TYPE "GastoCategoria" AS ENUM ('MATERIAL', 'MAO_DE_OBRA', 'EQUIPAMENTO', 'CONTRATO', 'ADMINISTRATIVO', 'OUTRO');

-- CreateEnum
CREATE TYPE "PagamentoStatus" AS ENUM ('PENDENTE', 'EFETUADO', 'EM_PROCESSAMENTO', 'ATRASADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "AlertaTipo" AS ENUM ('ORCAMENTO_70', 'ORCAMENTO_85', 'ORCAMENTO_100', 'ORCAMENTO_ESTOURADO', 'PRAZO_VENCIDO', 'PRAZO_PROXIMO', 'ESTOQUE_BAIXO', 'DADOS_INCONSISTENTES', 'IA_PREVISAO');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'VIEWER',
    "status" "UserStatus" NOT NULL DEFAULT 'PENDING',
    "avatar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT,
    "telefone" TEXT,
    "cpfCnpj" TEXT,
    "endereco" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Obra" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "clienteId" TEXT,
    "endereco" TEXT,
    "valorContrato" DECIMAL(12,2) NOT NULL,
    "dataInicio" TIMESTAMP(3) NOT NULL,
    "dataTermino" TIMESTAMP(3) NOT NULL,
    "status" "ObraStatus" NOT NULL DEFAULT 'EM_ANDAMENTO',
    "prioridade" "Prioridade" NOT NULL DEFAULT 'MEDIA',
    "progresso" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "cor" TEXT NOT NULL DEFAULT '#1565C0',
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Obra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Gasto" (
    "id" TEXT NOT NULL,
    "obraId" TEXT NOT NULL,
    "userId" TEXT,
    "descricao" TEXT NOT NULL,
    "categoria" "GastoCategoria" NOT NULL,
    "valor" DECIMAL(12,2) NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "comprovante" TEXT,
    "observacao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Gasto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemInventario" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "unidade" TEXT NOT NULL,
    "valorUnitario" DECIMAL(10,2) NOT NULL,
    "estoqueMinimo" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ItemInventario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ObraInventario" (
    "id" TEXT NOT NULL,
    "obraId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "qtdComprada" INTEGER NOT NULL,
    "qtdUsada" INTEGER NOT NULL DEFAULT 0,
    "local" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ObraInventario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pagamento" (
    "id" TEXT NOT NULL,
    "obraId" TEXT NOT NULL,
    "userId" TEXT,
    "descricao" TEXT NOT NULL,
    "valor" DECIMAL(12,2) NOT NULL,
    "dataVencimento" TIMESTAMP(3) NOT NULL,
    "dataPagamento" TIMESTAMP(3),
    "status" "PagamentoStatus" NOT NULL DEFAULT 'PENDENTE',
    "comprovante" TEXT,
    "observacao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pagamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contrato" (
    "id" TEXT NOT NULL,
    "obraId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "arquivo" TEXT,
    "valor" DECIMAL(12,2),
    "dataAssin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Contrato_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alerta" (
    "id" TEXT NOT NULL,
    "obraId" TEXT,
    "tipo" "AlertaTipo" NOT NULL,
    "titulo" TEXT NOT NULL,
    "mensagem" TEXT NOT NULL,
    "lido" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Alerta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ObraInventario_obraId_itemId_key" ON "ObraInventario"("obraId", "itemId");

-- AddForeignKey
ALTER TABLE "Obra" ADD CONSTRAINT "Obra_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Obra" ADD CONSTRAINT "Obra_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gasto" ADD CONSTRAINT "Gasto_obraId_fkey" FOREIGN KEY ("obraId") REFERENCES "Obra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gasto" ADD CONSTRAINT "Gasto_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ObraInventario" ADD CONSTRAINT "ObraInventario_obraId_fkey" FOREIGN KEY ("obraId") REFERENCES "Obra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ObraInventario" ADD CONSTRAINT "ObraInventario_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "ItemInventario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pagamento" ADD CONSTRAINT "Pagamento_obraId_fkey" FOREIGN KEY ("obraId") REFERENCES "Obra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pagamento" ADD CONSTRAINT "Pagamento_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contrato" ADD CONSTRAINT "Contrato_obraId_fkey" FOREIGN KEY ("obraId") REFERENCES "Obra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alerta" ADD CONSTRAINT "Alerta_obraId_fkey" FOREIGN KEY ("obraId") REFERENCES "Obra"("id") ON DELETE SET NULL ON UPDATE CASCADE;
