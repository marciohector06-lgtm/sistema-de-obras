export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { validarVariaveisAmbiente } = await import("@/lib/env");
    validarVariaveisAmbiente();
  }
}
