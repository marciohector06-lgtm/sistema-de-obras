// Dados mockados para a Fase 1 (layout) - serão substituídos por consultas reais ao Prisma na Fase 2

export interface MockObra {
  id: string;
  nome: string;
  cliente: string;
  valorContrato: number;
  gastoTotal: number;
  progresso: number;
  dataTermino: string;
}

export const MOCK_OBRAS: MockObra[] = [
  { id: "1", nome: "Sta. Lúcia Sul UTI", cliente: "Hospital Sta. Lúcia", valorContrato: 1850000, gastoTotal: 1295000, progresso: 70, dataTermino: "2026-11-15" },
  { id: "2", nome: "Galpão Industrial Taguatinga", cliente: "Fornax Logística", valorContrato: 980000, gastoTotal: 950600, progresso: 97, dataTermino: "2026-09-20" },
  { id: "3", nome: "Residencial Águas Claras", cliente: "Construtora Horizonte", valorContrato: 2400000, gastoTotal: 1080000, progresso: 45, dataTermino: "2027-02-10" },
  { id: "4", nome: "Ampliação Shopping Sul", cliente: "Sul América Empreendimentos", valorContrato: 3200000, gastoTotal: 3450000, progresso: 108, dataTermino: "2026-08-01" },
  { id: "5", nome: "Ponte Metálica Lago Norte", cliente: "GDF - Governo do DF", valorContrato: 1500000, gastoTotal: 620000, progresso: 41, dataTermino: "2027-05-30" },
];

export const MOCK_ALERTAS_RECENTES = [
  { id: "a1", titulo: "Orçamento estourado", obra: "Ampliação Shopping Sul", tipo: "danger" as const },
  { id: "a2", titulo: "Prazo próximo do vencimento", obra: "Galpão Industrial Taguatinga", tipo: "warning" as const },
  { id: "a3", titulo: "Estoque baixo de cimento", obra: "Sta. Lúcia Sul UTI", tipo: "warning" as const },
];
