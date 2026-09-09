import { XMLParser } from "fast-xml-parser";
import { prisma } from "@/lib/prisma";

interface ItemNFe {
  descricao: string;
  unidade: string;
  precoUnitario: number;
  ncm: string | null;
}

interface DetNode {
  prod?: {
    xProd?: unknown;
    uCom?: unknown;
    vUnCom?: unknown;
    NCM?: unknown;
  };
}

export function extrairItensNFe(xml: string): ItemNFe[] {
  const parser = new XMLParser({
    ignoreAttributes: true,
    isArray: (name) => name === "det",
  });

  const doc = parser.parse(xml);
  const infNFe = doc?.nfeProc?.NFe?.infNFe ?? doc?.NFe?.infNFe ?? doc?.infNFe;
  const dets: DetNode[] = infNFe?.det ?? [];

  return dets
    .map((det) => {
      const prod = det.prod ?? {};
      return {
        descricao: String(prod.xProd ?? "").trim(),
        unidade: String(prod.uCom ?? "UN").trim(),
        precoUnitario: Number(prod.vUnCom ?? 0),
        ncm: prod.NCM ? String(prod.NCM) : null,
      };
    })
    .filter((item) => item.descricao.length > 0);
}

export async function importarMateriaisDaNFe(xml: string): Promise<number> {
  const itens = extrairItensNFe(xml);

  for (const item of itens) {
    const existente = await prisma.material.findFirst({
      where: { descricao: { equals: item.descricao, mode: "insensitive" } },
    });

    if (existente) {
      await prisma.material.update({
        where: { id: existente.id },
        data: {
          preco: item.precoUnitario,
          unidade: item.unidade,
          ncm: item.ncm ?? existente.ncm,
        },
      });
    } else {
      await prisma.material.create({
        data: {
          descricao: item.descricao,
          unidade: item.unidade,
          preco: item.precoUnitario,
          ncm: item.ncm,
          origem: "NF-e (importado por e-mail)",
        },
      });
    }
  }

  return itens.length;
}
