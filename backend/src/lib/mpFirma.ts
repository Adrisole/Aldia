import { createHmac, timingSafeEqual } from "node:crypto";
import { Request } from "express";

/**
 * Verifica el header x-signature de los webhooks de Mercado Pago.
 * Formato documentado: "ts=1704908010,v1=<hmac-sha256 hex>"
 * Manifest firmado: "id:{data.id};request-id:{x-request-id};ts:{ts};"
 * (data.id en minúsculas si tiene letras).
 */
export function verificarFirmaWebhookMP(req: Request): boolean {
  const secreto = process.env.MP_WEBHOOK_SECRET;
  if (!secreto) {
    console.warn("MP_WEBHOOK_SECRET no configurado: no se puede verificar la firma del webhook");
    return false;
  }

  const xSignature = req.header("x-signature");
  const xRequestId = req.header("x-request-id");
  const dataId = req.query["data.id"];
  if (!xSignature || !xRequestId || typeof dataId !== "string") return false;

  const partes = Object.fromEntries(
    xSignature.split(",").map((par) => {
      const [k, v] = par.split("=");
      return [k?.trim(), v?.trim()];
    }),
  );
  const ts = partes.ts;
  const v1 = partes.v1;
  if (!ts || !v1) return false;

  const manifest = `id:${dataId.toLowerCase()};request-id:${xRequestId};ts:${ts};`;
  const firmaEsperada = createHmac("sha256", secreto).update(manifest).digest("hex");

  const a = Buffer.from(v1, "hex");
  const b = Buffer.from(firmaEsperada, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}
