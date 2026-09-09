const VARIAVEIS_OBRIGATORIAS = [
  "DATABASE_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
] as const;

export function validarVariaveisAmbiente(): void {
  const faltando = VARIAVEIS_OBRIGATORIAS.filter((chave) => !process.env[chave]);

  if (faltando.length > 0) {
    throw new Error(
      `Variáveis de ambiente obrigatórias ausentes: ${faltando.join(", ")}. Configure o .env.local antes de iniciar a aplicação.`
    );
  }
}
