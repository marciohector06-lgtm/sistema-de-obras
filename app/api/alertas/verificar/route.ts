import { NextResponse } from "next/server";
import { verificarTodasObras } from "@/lib/alertas";

export async function POST() {
  await verificarTodasObras();
  return NextResponse.json({ ok: true });
}
