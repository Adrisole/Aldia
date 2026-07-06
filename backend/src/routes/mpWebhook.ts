import { Router } from "express";
import { prisma } from "../lib/prisma";
import { verificarFirmaWebhookMP } from "../lib/mpFirma";
import { consultarPagoParaTenant } from "../services/mpTokens";
import { generarNumeroRecibo } from "../lib/recibos";
import { cancelarPendientes } from "../services/secuencia";

export const mpWebhookRouter = Router();

async function procesarNotificacion(tenantId: string, paymentId: string): Promise<void> {
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant || !tenant.mpConectado) {
    console.warn(`Webhook MP: tenant ${tenantId} no encontrado o sin MP conectado`);
    return;
  }

  // Nunca confiar en el payload del webhook: se vuelve a consultar el pago a la API (§6.3.3).
  const pago = await consultarPagoParaTenant(tenant, paymentId);

  if (pago.status !== "approved") {
    console.log(`Webhook MP: pago ${paymentId} en estado "${pago.status}", no se actúa`);
    return;
  }

  if (!pago.external_reference) {
    console.warn(`Webhook MP: pago ${paymentId} approved sin external_reference`);
    return;
  }

  const deuda = await prisma.deuda.findFirst({
    where: { id: pago.external_reference, tenantId: tenant.id },
  });
  if (!deuda) {
    console.warn(`Webhook MP: pago ${paymentId} no corresponde a ninguna deuda de tenant ${tenant.id}`);
    return;
  }

  // Idempotencia: si ya existe un cobro con este mp_payment_id, no se duplica.
  const cobroExistente = await prisma.cobro.findUnique({ where: { mpPaymentId: String(pago.id) } });
  if (cobroExistente) return;

  if (deuda.estado === "cobrada") {
    console.warn(`Webhook MP: deuda ${deuda.id} ya estaba cobrada; pago ${paymentId} no se duplica`);
    return;
  }

  await prisma.$transaction(async (tx) => {
    await tx.deuda.update({ where: { id: deuda.id }, data: { estado: "cobrada" } });

    const numeroRecibo = await generarNumeroRecibo(tx, tenant.id);
    await tx.cobro.create({
      data: {
        tenantId: tenant.id,
        deudaId: deuda.id,
        numeroRecibo,
        monto: deuda.monto,
        medio: "mercado_pago",
        via: "automatico",
        mpPaymentId: String(pago.id),
      },
    });

    await tx.mensaje.create({
      data: {
        tenantId: tenant.id,
        deudaId: deuda.id,
        direccion: "sistema",
        tipo: "sistema",
        contenido: `Pago acreditado por Mercado Pago · secuencia finalizada`,
      },
    });
    await tx.mensaje.create({
      data: {
        tenantId: tenant.id,
        deudaId: deuda.id,
        direccion: "saliente",
        tipo: "recibo",
        contenido: `Recibimos tu pago. Gracias.\n\nRecibo ${numeroRecibo}\n${deuda.concepto}\nMedio: Mercado Pago\n\nGuardá este mensaje como comprobante.`,
      },
    });
  });

  await cancelarPendientes(deuda.id);
}

mpWebhookRouter.post("/webhooks/mp", (req, res) => {
  if (!verificarFirmaWebhookMP(req)) {
    return res.status(401).json({ error: "Firma inválida" });
  }

  const tenantId = req.query.tenant_id;
  const paymentId = req.query["data.id"];

  // Responder 200 de inmediato: MP reintenta si no hay respuesta rápida (§6.3.2).
  // El procesamiento real sigue de forma asíncrona.
  res.status(200).end();

  if (typeof tenantId !== "string" || typeof paymentId !== "string") {
    console.warn("Webhook MP: faltan tenant_id o data.id en la notificación");
    return;
  }

  procesarNotificacion(tenantId, paymentId).catch((e) => {
    console.error(`Error procesando webhook de MP (tenant ${tenantId}, pago ${paymentId}):`, e);
  });
});
