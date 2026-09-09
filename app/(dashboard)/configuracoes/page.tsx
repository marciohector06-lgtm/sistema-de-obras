import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/SectionCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ConfiguracaoEmailForm } from "@/components/configuracoes/ConfiguracaoEmailForm";
import { VerificarEmailButton } from "@/components/configuracoes/VerificarEmailButton";
import { formatDateBR } from "@/lib/utils";
import type { ImportacaoEmailTipo, ImportacaoEmailStatus } from "@/types";

export const dynamic = "force-dynamic";

const TIPO_LABELS: Record<ImportacaoEmailTipo, string> = {
  NFE: "NF-e",
  PIX_INTER: "Pix Banco Inter",
  GERAL: "Geral",
};

const STATUS_VARIANT: Record<ImportacaoEmailStatus, "success" | "danger"> = {
  SUCESSO: "success",
  ERRO: "danger",
};

export default async function ConfiguracoesPage() {
  const [config, logs] = await Promise.all([
    prisma.configuracaoEmail.findUnique({ where: { id: "config" } }),
    prisma.importacaoEmailLog.findMany({ orderBy: { createdAt: "desc" }, take: 30 }),
  ]);

  return (
    <div>
      <PageHeader title="Configurações" />

      <div className="space-y-6">
        <SectionCard
          title="Automações via E-mail"
          description="Credenciais IMAP usadas para importar NF-e (XML anexado) e notificações de Pix do Banco Inter"
          action={<VerificarEmailButton />}
        >
          <ConfiguracaoEmailForm
            configuracaoAtual={
              config
                ? {
                    host: config.host,
                    porta: config.porta,
                    usuario: config.usuario,
                    usarSsl: config.usarSsl,
                    ativo: config.ativo,
                  }
                : null
            }
          />
          {config?.ultimaVerificacaoEm && (
            <p className="mt-4 text-xs text-text-muted">
              Última verificação: {formatDateBR(config.ultimaVerificacaoEm)}
            </p>
          )}
        </SectionCard>

        <SectionCard title="Histórico de Importações">
          {logs.length === 0 ? (
            <p className="py-6 text-center text-sm text-text-muted">Nenhuma verificação executada ainda.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Mensagem</TableHead>
                  <TableHead className="text-right">Qtd.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-text-secondary">{formatDateBR(log.createdAt)}</TableCell>
                    <TableCell>{TIPO_LABELS[log.tipo]}</TableCell>
                    <TableCell>
                      <StatusBadge variant={STATUS_VARIANT[log.status]}>{log.status === "SUCESSO" ? "Sucesso" : "Erro"}</StatusBadge>
                    </TableCell>
                    <TableCell className="text-text-secondary">{log.mensagem}</TableCell>
                    <TableCell className="text-right">{log.quantidadeProcessada}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
