import { createHmac, timingSafeEqual } from "node:crypto";

const CINCO_MINUTOS_MS = 5 * 60 * 1000;

function secreto(): string {
  const s = process.env.MP_OAUTH_STATE_SECRET;
  if (!s) throw new Error("MP_OAUTH_STATE_SECRET no está configurado");
  return s;
}

function firmar(payload: string): string {
  return createHmac("sha256", secreto()).update(payload).digest("hex");
}

/** Firma un state HMAC para el flujo OAuth: impide que un tenant conecte la cuenta MP de otro. */
export function firmarState(tenantId: string): string {
  const payload = `${tenantId}.${Date.now()}`;
  return `${payload}.${firmar(payload)}`;
}

/** Verifica el state recibido en el callback y devuelve el tenantId si es válido y no expiró. */
export function verificarState(state: string): string | null {
  const partes = state.split(".");
  if (partes.length !== 3) return null;
  const [tenantId, timestampStr, firma] = partes;
  const payload = `${tenantId}.${timestampStr}`;
  const firmaEsperada = firmar(payload);

  const a = Buffer.from(firma, "hex");
  const b = Buffer.from(firmaEsperada, "hex");
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  const timestamp = Number(timestampStr);
  if (!Number.isFinite(timestamp) || Date.now() - timestamp > CINCO_MINUTOS_MS) return null;

  return tenantId;
}
