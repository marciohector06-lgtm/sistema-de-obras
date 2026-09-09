import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { protegido } from "@/lib/api-handler";

export const dynamic = "force-dynamic";

export const GET = protegido(
  async () => {
    const logs = await prisma.importacaoEmailLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 30,
    });

    return NextResponse.json(logs);
  },
  { nivel: "admin" }
);
