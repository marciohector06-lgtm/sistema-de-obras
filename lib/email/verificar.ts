import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import { prisma } from "@/lib/prisma";
import { descriptografar } from "@/lib/crypto";
import { importarMateriaisDaNFe } from "@/lib/email/nfe";
import { extrairPixInter, importarPixComoMovimento } from "@/lib/email/pix-inter";
import { formatBRL } from "@/lib/utils";
import type { ImportacaoEmailTipo } from "@/types";

async function registrarLog(tipo: ImportacaoEmailTipo, status: "SUCESSO" | "ERRO", mensagem: string, quantidade = 0) {
  await prisma.importacaoEmailLog.create({
    data: { tipo, status, mensagem, quantidadeProcessada: quantidade },
  });
}

export interface ResultadoVerificacao {
  executada: boolean;
  processadas: number;
  erros: string[];
}

export async function executarVerificacaoEmail(): Promise<ResultadoVerificacao> {
  const config = await prisma.configuracaoEmail.findUnique({ where: { id: "config" } });

  if (!config || !config.ativo) {
    return { executada: false, processadas: 0, erros: [] };
  }

  const senha = descriptografar(config.senhaCriptografada);
  const client = new ImapFlow({
    host: config.host,
    port: config.porta,
    secure: config.usarSsl,
    auth: { user: config.usuario, pass: senha },
    logger: false,
  });

  let processadas = 0;
  const erros: string[] = [];

  try {
    await client.connect();
    const lock = await client.getMailboxLock("INBOX");

    try {
      const uids = await client.search({ seen: false });

      for (const uid of uids || []) {
        try {
          const mensagem = await client.fetchOne(String(uid), { source: true }, { uid: true });
          if (!mensagem || !mensagem.source) continue;

          const parsed = await simpleParser(mensagem.source);
          const assunto = parsed.subject ?? "sem assunto";

          const anexoXml = parsed.attachments.find(
            (anexo) =>
              anexo.filename?.toLowerCase().endsWith(".xml") ||
              anexo.contentType === "text/xml" ||
              anexo.contentType === "application/xml"
          );

          if (anexoXml) {
            const quantidade = await importarMateriaisDaNFe(anexoXml.content.toString("utf-8"));
            await registrarLog("NFE", "SUCESSO", `${quantidade} item(ns) de material importado(s) de "${assunto}"`, quantidade);
            processadas += quantidade;
          } else if (
            (parsed.from?.text ?? "").toLowerCase().includes("bancointer") ||
            assunto.toLowerCase().includes("pix")
          ) {
            const pix = extrairPixInter(parsed.text ?? "");
            if (pix) {
              await importarPixComoMovimento(pix, parsed.date ?? new Date());
              await registrarLog(
                "PIX_INTER",
                "SUCESSO",
                `Pix de ${formatBRL(pix.valor)} registrado${pix.nomePagador ? ` (${pix.nomePagador})` : ""}`,
                1
              );
              processadas += 1;
            }
          }

          await client.messageFlagsAdd(String(uid), ["\\Seen"], { uid: true });
        } catch (erroMensagem) {
          const msg = erroMensagem instanceof Error ? erroMensagem.message : String(erroMensagem);
          erros.push(msg);
          await registrarLog("GERAL", "ERRO", `Falha ao processar uma mensagem: ${msg}`);
        }
      }
    } finally {
      lock.release();
    }
  } catch (erroConexao) {
    const msg = erroConexao instanceof Error ? erroConexao.message : String(erroConexao);
    erros.push(msg);
    await registrarLog("GERAL", "ERRO", `Falha na conexão IMAP: ${msg}`);
  } finally {
    await client.logout().catch(() => {});
  }

  await prisma.configuracaoEmail.update({
    where: { id: "config" },
    data: { ultimaVerificacaoEm: new Date() },
  });

  return { executada: true, processadas, erros };
}
