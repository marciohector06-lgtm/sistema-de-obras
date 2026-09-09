import { config } from "dotenv";

config({ path: ".env.local" });

async function main() {
  const cron = await import("node-cron");
  const { executarVerificacaoEmail } = await import("../lib/email/verificar");

  async function rodar() {
    const inicio = new Date().toISOString();
    const resultado = await executarVerificacaoEmail();
    console.log(`[${inicio}] verificação de e-mail:`, resultado);
  }

  cron.schedule("0 8,14,20 * * *", () => {
    rodar().catch((erro) => console.error("Falha na verificação de e-mail:", erro));
  });

  console.log("Cron de automação por e-mail iniciado (08h, 14h e 20h todos os dias).");
  await rodar().catch((erro) => console.error("Falha na verificação inicial de e-mail:", erro));
}

main();
