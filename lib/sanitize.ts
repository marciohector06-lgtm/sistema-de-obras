const REGEX_TAG_HTML = /<\/?[a-zA-Z][a-zA-Z0-9]*(?:\s[^<>]*)?>/g;

export function sanitizarTexto(valor: string): string {
  return valor.replace(REGEX_TAG_HTML, "").trim();
}

function sanitizarValor(valor: unknown): unknown {
  if (typeof valor === "string") return sanitizarTexto(valor);
  if (Array.isArray(valor)) return valor.map(sanitizarValor);
  if (valor && typeof valor === "object" && !(valor instanceof Date)) {
    return sanitizarObjeto(valor as Record<string, unknown>);
  }
  return valor;
}

export function sanitizarObjeto<T extends Record<string, unknown>>(objeto: T): T {
  const resultado = { ...objeto };

  for (const chave in resultado) {
    resultado[chave] = sanitizarValor(resultado[chave]) as T[typeof chave];
  }

  return resultado;
}
