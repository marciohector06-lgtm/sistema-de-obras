-- CreateEnum
CREATE TYPE "ImportacaoEmailTipo" AS ENUM ('NFE', 'PIX_INTER');

-- CreateEnum
CREATE TYPE "ImportacaoEmailStatus" AS ENUM ('SUCESSO', 'ERRO');

-- CreateTable
CREATE TABLE "ConfiguracaoEmail" (
    "id" TEXT NOT NULL DEFAULT 'config',
    "host" TEXT NOT NULL,
    "porta" INTEGER NOT NULL DEFAULT 993,
    "usuario" TEXT NOT NULL,
    "senhaCriptografada" TEXT NOT NULL,
    "usarSsl" BOOLEAN NOT NULL DEFAULT true,
    "ativo" BOOLEAN NOT NULL DEFAULT false,
    "ultimaVerificacaoEm" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConfiguracaoEmail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportacaoEmailLog" (
    "id" TEXT NOT NULL,
    "tipo" "ImportacaoEmailTipo" NOT NULL,
    "status" "ImportacaoEmailStatus" NOT NULL,
    "mensagem" TEXT NOT NULL,
    "quantidadeProcessada" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImportacaoEmailLog_pkey" PRIMARY KEY ("id")
);
