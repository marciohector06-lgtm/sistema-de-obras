import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const logs = await prisma.importacaoEmailLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return NextResponse.json(logs);
}
