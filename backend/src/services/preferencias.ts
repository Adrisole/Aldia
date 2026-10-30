import { Deuda, Tenant } from "@prisma/client";
import { crearPreferenciaParaTenant } from "./mpTokens";
import { prisma } from "../lib/prisma";

function publicBaseUrl(): string {
  return process.env.PUBLIC_BASE_URL ?? "http://localhost:3000";
}

/** URL de checkout reconstruida a partir del preference_id (mismo patrón que el init_point de MP). */
export function linkDePago(mpPreferenceId: string): string {
  return `https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=${mpPreferenceId}`;
}

/**
 * Genera (una sola vez) la preferencia de pago de una deuda al entrar en
 * secuencia (§6.2). Si el tenant todavía no conectó Mercado Pago, no falla:
 * la secuencia igual arranca, solo que los mensajes van sin link de pago
 * hasta que el negocio conecte su cuenta.
 */
export async function asegurarPreferencia(deuda: Deuda, tenant: Tenant): Promise<string | null> {
  if (deuda.mpPreferenceId) return deuda.mpPreferenceId;
  if (!tenant.mpConectado) return null;

  try {
    const preferencia = await crearPreferenciaParaTenant(tenant, {
      titulo: deuda.concepto,
      monto: Number(deuda.monto),
      externalReference: deuda.id,
      notificationUrl: `${publicBaseUrl()}/webhooks/mp?tenant_id=${tenant.id}`,
    });
    await prisma.deuda.update({ where: { id: deuda.id }, data: { mpPreferenceId: preferencia.id } });
    return preferencia.id;
  } catch (e) {
    console.error(`No se pudo generar la preferencia de pago de la deuda ${deuda.id}:`, e);
    return null;
  }
}
