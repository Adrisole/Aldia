import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";

const ALGORITMO = "aes-256-gcm";

function claveDerivada(): Buffer {
  const secreto = process.env.ENCRYPTION_KEY;
  if (!secreto) throw new Error("ENCRYPTION_KEY no está configurado");
  return scryptSync(secreto, "aldia-mp-tokens", 32);
}

/** Cifra un valor para guardarlo en la DB. Formato: iv:authTag:cipherText, todo en base64. */
export function cifrar(texto: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITMO, claveDerivada(), iv);
  const cifrado = Buffer.concat([cipher.update(texto, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [iv.toString("base64"), authTag.toString("base64"), cifrado.toString("base64")].join(":");
}

export function descifrar(valor: string): string {
  const [ivB64, authTagB64, cifradoB64] = valor.split(":");
  if (!ivB64 || !authTagB64 || !cifradoB64) {
    throw new Error("Formato de valor cifrado inválido");
  }
  const decipher = createDecipheriv(ALGORITMO, claveDerivada(), Buffer.from(ivB64, "base64"));
  decipher.setAuthTag(Buffer.from(authTagB64, "base64"));
  const descifrado = Buffer.concat([decipher.update(Buffer.from(cifradoB64, "base64")), decipher.final()]);
  return descifrado.toString("utf8");
}
