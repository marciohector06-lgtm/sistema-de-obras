import { config } from "dotenv";
import { defineConfig, env } from "prisma/config";

// Next.js usa .env.local (não .env) - carregamos explicitamente para os comandos da CLI do Prisma
config({ path: ".env.local" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
