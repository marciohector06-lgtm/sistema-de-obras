import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

function getChave(): Buffer {
  const segredo = process.env.EMAIL_CREDENTIALS_SECRET;
  if (!segredo) {
    throw new Error("EMAIL_CREDENTIALS_SECRET não configurada");
  }
  return createHash("sha256").update(segredo).digest();
}

export function criptografar(texto: string): string {
  const chave = getChave();
  const iv = randomBytes(12);
  const cifra = createCipheriv("aes-256-gcm", chave, iv);
  const cifrado = Buffer.concat([cifra.update(texto, "utf8"), cifra.final()]);
  const authTag = cifra.getAuthTag();
  return Buffer.concat([iv, authTag, cifrado]).toString("base64");
}

export function descriptografar(valor: string): string {
  const chave = getChave();
  const dados = Buffer.from(valor, "base64");
  const iv = dados.subarray(0, 12);
  const authTag = dados.subarray(12, 28);
  const cifrado = dados.subarray(28);
  const decifra = createDecipheriv("aes-256-gcm", chave, iv);
  decifra.setAuthTag(authTag);
  return Buffer.concat([decifra.update(cifrado), decifra.final()]).toString("utf8");
}
