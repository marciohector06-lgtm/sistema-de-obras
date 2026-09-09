import { PrismaClient, ObraStatus, GastoCategoria } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { createClient } from "@supabase/supabase-js";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const ADMIN_EMAIL = "admin@fornaxengenharia.com.br";
const ADMIN_SENHA = "admin123";

async function criarUsuarioAuth() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chave = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !chave) {
    console.log("Supabase nao configurado - pulando criacao do usuario de autenticacao.");
    return;
  }

  const supabase = createClient(url, chave, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: existentes } = await supabase.auth.admin.listUsers();
  const jaExiste = existentes?.users.find((u) => u.email === ADMIN_EMAIL);

  if (jaExiste) return;

  const { error } = await supabase.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_SENHA,
    email_confirm: true,
  });

  if (error) throw error;
}

async function main() {
  console.log("Iniciando seed com dados reais da Fornax...");

  await criarUsuarioAuth();

  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {},
    create: {
      name: "Márcio Héctor",
      email: ADMIN_EMAIL,
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  const clienteHospital = await prisma.cliente.upsert({
    where: { id: "cliente-hospital-sta-lucia" },
    update: {},
    create: {
      id: "cliente-hospital-sta-lucia",
      nome: "Hospital Santa Lúcia Sul S/A",
      email: "contato@santalucia.com.br",
    },
  });

  const clienteUBEC = await prisma.cliente.upsert({
    where: { id: "cliente-ubec" },
    update: {},
    create: {
      id: "cliente-ubec",
      nome: "União Brasileira de Educação Católica - UBEC",
      email: "contato@ucb.br",
    },
  });

  const clientePollyanne = await prisma.cliente.upsert({
    where: { id: "cliente-pollyanne" },
    update: {},
    create: {
      id: "cliente-pollyanne",
      nome: "Pollyanne Silva Cunha",
    },
  });

  const clienteAntonio = await prisma.cliente.upsert({
    where: { id: "cliente-antonio" },
    update: {},
    create: {
      id: "cliente-antonio",
      nome: "Antônio Carlos Lichtsztejn",
    },
  });

  const clienteRedeSanta = await prisma.cliente.upsert({
    where: { id: "cliente-rede-santa" },
    update: {},
    create: {
      id: "cliente-rede-santa",
      nome: "Rede Santa",
    },
  });

  const obraMarquise = await prisma.obra.upsert({
    where: { id: "obra-marquise-sta-lucia-sul" },
    update: {},
    create: {
      id: "obra-marquise-sta-lucia-sul",
      nome: "Estrutura e Marquise - Santa Lúcia Sul",
      clienteId: clienteHospital.id,
      endereco: "SHLS Conjunto C Blocos A,B,C - Brasília/DF CEP: 70390-700",
      valorContrato: 540000.0,
      dataInicio: new Date("2026-08-04"),
      dataTermino: new Date("2026-12-04"),
      status: ObraStatus.EM_ANDAMENTO,
      createdById: admin.id,
    },
  });

  const obraUCB = await prisma.obra.upsert({
    where: { id: "obra-ucb" },
    update: {},
    create: {
      id: "obra-ucb",
      nome: "Universidade Católica de Brasília – UCB",
      clienteId: clienteUBEC.id,
      endereco: "QS 07, Lote 01, Taguatinga Sul - Taguatinga, Brasília - DF, 71966-700",
      valorContrato: 103860.74,
      dataInicio: new Date("2026-05-11"),
      dataTermino: new Date("2026-06-11"),
      status: ObraStatus.EM_ANDAMENTO,
      createdById: admin.id,
    },
  });

  const obraSushi = await prisma.obra.upsert({
    where: { id: "obra-sushi-gourmet" },
    update: {},
    create: {
      id: "obra-sushi-gourmet",
      nome: "Sushi Gourmet Restaurante",
      clienteId: clientePollyanne.id,
      endereco: "QE 15 Bloco A Loja 7 e 11, Guará II, Brasília/DF, CEP: 71050-611",
      valorContrato: 135000.0,
      dataInicio: new Date("2026-03-29"),
      dataTermino: new Date("2026-06-29"),
      status: ObraStatus.EM_ANDAMENTO,
      createdById: admin.id,
    },
  });

  const obraYatai = await prisma.obra.upsert({
    where: { id: "obra-yatai-yoru" },
    update: {},
    create: {
      id: "obra-yatai-yoru",
      nome: "Obra - Restaurante Yatai Yoru",
      clienteId: clienteAntonio.id,
      endereco: "Asa Norte CLN 404 Bloco B Loja 44 - Asa Norte, Brasília - DF, 70845-520",
      valorContrato: 81865.45,
      descricao: "60 dias de prazo",
      dataInicio: new Date("2026-01-12"),
      dataTermino: new Date("2026-03-12"),
      status: ObraStatus.EM_ANDAMENTO,
      createdById: admin.id,
    },
  });

  const obraSobradinho = await prisma.obra.upsert({
    where: { id: "obra-sta-lucia-sobradinho" },
    update: {},
    create: {
      id: "obra-sta-lucia-sobradinho",
      nome: "Obra - Santa Lúcia Sobradinho",
      endereco: "Q 14 Area Especial 09 A11 - Sobradinho/DF, CEP: 73050-024",
      valorContrato: 900000.0,
      dataInicio: new Date("2025-11-26"),
      dataTermino: new Date("2026-04-26"),
      status: ObraStatus.EM_ANDAMENTO,
      createdById: admin.id,
    },
  });

  const obraRoyalFace = await prisma.obra.upsert({
    where: { id: "obra-royal-face" },
    update: {},
    create: {
      id: "obra-royal-face",
      nome: "Obra - Royal Face",
      endereco: "Setor Tradicional Quadra 24 - Planaltina/DF",
      valorContrato: 24000.0,
      dataInicio: new Date("2025-11-06"),
      dataTermino: new Date("2026-02-06"),
      status: ObraStatus.EM_ANDAMENTO,
      createdById: admin.id,
    },
  });

  const obraUTI = await prisma.obra.upsert({
    where: { id: "obra-sta-lucia-sul-uti" },
    update: {},
    create: {
      id: "obra-sta-lucia-sul-uti",
      nome: "Obra - Santa Lúcia Sul UTI",
      clienteId: clienteRedeSanta.id,
      endereco: "SHLS 716 Bloco F - Asa Sul, Brasília - DF, 70390-700",
      valorContrato: 3744000.0,
      dataInicio: new Date("2025-06-01"),
      dataTermino: new Date("2026-12-31"),
      status: ObraStatus.EM_ANDAMENTO,
      createdById: admin.id,
    },
  });

  const gastos = [
    { obraId: obraMarquise.id, descricao: "Materiais estruturais", categoria: GastoCategoria.MATERIAL, valor: 22000.0, data: new Date("2026-08-10") },
    { obraId: obraMarquise.id, descricao: "Mão de obra inicial", categoria: GastoCategoria.MAO_DE_OBRA, valor: 15696.31, data: new Date("2026-08-20") },

    { obraId: obraUCB.id, descricao: "Materiais de construção", categoria: GastoCategoria.MATERIAL, valor: 20000.0, data: new Date("2026-05-15") },
    { obraId: obraUCB.id, descricao: "Equipe de execução", categoria: GastoCategoria.MAO_DE_OBRA, valor: 17052.56, data: new Date("2026-05-25") },

    { obraId: obraSushi.id, descricao: "Materiais de acabamento", categoria: GastoCategoria.MATERIAL, valor: 14000.0, data: new Date("2026-04-05") },
    { obraId: obraSushi.id, descricao: "Mão de obra especializada", categoria: GastoCategoria.MAO_DE_OBRA, valor: 10375.94, data: new Date("2026-04-20") },

    { obraId: obraYatai.id, descricao: "Mão de obra Equipe 1", categoria: GastoCategoria.MAO_DE_OBRA, valor: 5000.0, data: new Date("2026-01-20") },
    { obraId: obraYatai.id, descricao: "Mão de obra Equipe 2", categoria: GastoCategoria.MAO_DE_OBRA, valor: 4500.0, data: new Date("2026-02-01") },
    { obraId: obraYatai.id, descricao: "Mão de obra Equipe 3", categoria: GastoCategoria.MAO_DE_OBRA, valor: 4000.0, data: new Date("2026-02-10") },
    { obraId: obraYatai.id, descricao: "Materiais diversos", categoria: GastoCategoria.MATERIAL, valor: 30410.57, data: new Date("2026-02-20") },

    { obraId: obraSobradinho.id, descricao: "Contrato de fornecimento - Fase 1", categoria: GastoCategoria.CONTRATO, valor: 150000.0, data: new Date("2025-12-01") },
    { obraId: obraSobradinho.id, descricao: "Materiais estruturais - Fase 1", categoria: GastoCategoria.MATERIAL, valor: 120000.0, data: new Date("2026-01-15") },
    { obraId: obraSobradinho.id, descricao: "Mão de obra - Fase 1", categoria: GastoCategoria.MAO_DE_OBRA, valor: 80000.0, data: new Date("2026-02-01") },
    { obraId: obraSobradinho.id, descricao: "Equipamentos alugados", categoria: GastoCategoria.EQUIPAMENTO, valor: 21166.61, data: new Date("2026-03-01") },

    { obraId: obraRoyalFace.id, descricao: "Materiais iniciais", categoria: GastoCategoria.MATERIAL, valor: 18000.0, data: new Date("2025-11-20") },
    { obraId: obraRoyalFace.id, descricao: "Mão de obra execução", categoria: GastoCategoria.MAO_DE_OBRA, valor: 20000.0, data: new Date("2025-12-10") },
    { obraId: obraRoyalFace.id, descricao: "Materiais adicionais não previstos", categoria: GastoCategoria.MATERIAL, valor: 13932.81, data: new Date("2026-01-15") },

    { obraId: obraUTI.id, descricao: "Contrato principal - Fase 1", categoria: GastoCategoria.CONTRATO, valor: 800000.0, data: new Date("2025-07-01") },
    { obraId: obraUTI.id, descricao: "Materiais estruturais - Fase 1", categoria: GastoCategoria.MATERIAL, valor: 400000.0, data: new Date("2025-08-01") },
    { obraId: obraUTI.id, descricao: "Mão de obra especializada", categoria: GastoCategoria.MAO_DE_OBRA, valor: 350000.0, data: new Date("2025-09-01") },
    { obraId: obraUTI.id, descricao: "Contrato - Fase 2", categoria: GastoCategoria.CONTRATO, valor: 300000.0, data: new Date("2025-11-01") },
    { obraId: obraUTI.id, descricao: "Materiais - Fase 2", categoria: GastoCategoria.MATERIAL, valor: 150000.0, data: new Date("2026-01-01") },
    { obraId: obraUTI.id, descricao: "Equipamentos e instalações", categoria: GastoCategoria.EQUIPAMENTO, valor: 46014.45, data: new Date("2026-03-01") },
  ];

  for (const gasto of gastos) {
    await prisma.gasto.create({ data: { ...gasto, userId: admin.id } });
  }

  const materiais = [
    { nome: "Cimento CP II", unidade: "sacos", valorUnitario: 25.0 },
    { nome: "Aço CA-50", unidade: "barras", valorUnitario: 150.0 },
    { nome: "Areia Média", unidade: "m³", valorUnitario: 80.0 },
    { nome: "Brita 1/2", unidade: "m³", valorUnitario: 100.0 },
    { nome: "Tijolo Cerâmico", unidade: "unidade", valorUnitario: 0.8 },
    { nome: "Cal Hidratada", unidade: "sacos", valorUnitario: 20.0 },
    { nome: "Madeira Serrada", unidade: "m³", valorUnitario: 300.0 },
    { nome: "Tubos PVC", unidade: "unidade", valorUnitario: 15.0 },
    { nome: "Fios Elétricos", unidade: "metros", valorUnitario: 5.0 },
    { nome: "Ferragens Diversas", unidade: "kits", valorUnitario: 50.0 },
    { nome: "Cabos", unidade: "metros", valorUnitario: 5.0 },
  ];

  const itensInventario: Record<string, string> = {};
  for (const mat of materiais) {
    const item = await prisma.itemInventario.create({ data: { ...mat, estoqueMinimo: 10 } });
    itensInventario[mat.nome] = item.id;
  }

  const estoqueObras = [
    { nome: "Cimento CP II", obraId: obraMarquise.id, qtdComprada: 100, qtdUsada: 30, local: "Depósito Central" },
    { nome: "Aço CA-50", obraId: obraMarquise.id, qtdComprada: 50, qtdUsada: 30, local: "Depósito Central" },
    { nome: "Areia Média", obraId: obraMarquise.id, qtdComprada: 200, qtdUsada: 100, local: "Depósito Central" },
    { nome: "Brita 1/2", obraId: obraMarquise.id, qtdComprada: 150, qtdUsada: 40, local: "Depósito Central" },
    { nome: "Tijolo Cerâmico", obraId: obraUCB.id, qtdComprada: 5000, qtdUsada: 2000, local: "Obra Santa Lucia" },
    { nome: "Cal Hidratada", obraId: obraMarquise.id, qtdComprada: 250, qtdUsada: 50, local: "Depósito Central" },
    { nome: "Madeira Serrada", obraId: obraMarquise.id, qtdComprada: 120, qtdUsada: 30, local: "Depósito Central" },
    { nome: "Tubos PVC", obraId: obraMarquise.id, qtdComprada: 300, qtdUsada: 100, local: "Depósito Central" },
    { nome: "Fios Elétricos", obraId: obraRoyalFace.id, qtdComprada: 500, qtdUsada: 150, local: "Obra Boliche" },
    { nome: "Ferragens Diversas", obraId: obraMarquise.id, qtdComprada: 100, qtdUsada: 20, local: "Depósito Central" },
    { nome: "Cabos", obraId: obraRoyalFace.id, qtdComprada: 500, qtdUsada: 150, local: "Obra Boliche" },
  ];

  for (const estoque of estoqueObras) {
    await prisma.obraInventario.create({
      data: {
        obraId: estoque.obraId,
        itemId: itensInventario[estoque.nome],
        qtdComprada: estoque.qtdComprada,
        qtdUsada: estoque.qtdUsada,
        local: estoque.local,
      },
    });
  }

  const entradas = [
    { obraId: obraMarquise.id, descricao: "Entrada de 30%", valor: 270000.0, data: new Date("2026-08-11") },
    { obraId: obraUCB.id, descricao: "Entrada de 30%", valor: 31158.23, data: new Date("2026-05-15") },
    { obraId: obraSushi.id, descricao: "1ª Medição", valor: 37800.0, data: new Date("2026-04-30") },
    { obraId: obraSushi.id, descricao: "2ª Medição", valor: 18900.0, data: new Date("2026-05-15") },
    { obraId: obraSushi.id, descricao: "3ª Medição", valor: 18900.0, data: new Date("2026-05-30") },
    { obraId: obraYatai.id, descricao: "Entrada contratual", valor: 24559.65, data: new Date("2026-01-15") },
  ];

  for (const entrada of entradas) {
    await prisma.entrada.create({ data: entrada });
  }

  console.log("Seed concluido com sucesso.");
  console.log("Dados carregados:");
  console.log("  5 clientes");
  console.log("  7 obras reais da Fornax");
  console.log("  23 gastos historicos");
  console.log("  11 itens de inventario");
  console.log("  6 entradas financeiras");
  console.log("");
  console.log(`Login admin: ${ADMIN_EMAIL} | ${ADMIN_SENHA}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
