import { Tenant } from "@prisma/client";
import { cifrar, descifrar } from "../lib/crypto";
import { consultarPago, crearPreferencia, PagoMP, PreferenciaMP, refrescarToken } from "../lib/mercadopago";
import { prisma } from "../lib/prisma";

async function refrescarYGuardarToken(tenantId: string, refreshTokenCifrado: string): Promise<string> {
  const nuevo = await refrescarToken(descifrar(refreshTokenCifrado));
  await prisma.tenant.update({
    where: { id: tenantId },
    data: {
      mpAccessToken: cifrar(nuevo.access_token),
      mpRefreshToken: cifrar(nuevo.refresh_token),
    },
  });
  return nuevo.access_token;
}

/**
 * Ejecuta `llamada` con el access_token vigente del tenant. Los tokens de MP
 * expiran a los 180 días (§6.1): si la llamada falla por token vencido, se
 * refresca una vez con el refresh_token y se reintenta (chequeo lazy en vez
 * de un cron aparte para renovar algo que puede no usarse en meses).
 */
async function conAccessTokenTenant<T>(
  tenant: Pick<Tenant, "id" | "mpAccessToken" | "mpRefreshToken">,
  llamada: (accessToken: string) => Promise<T>,
): Promise<T> {
  if (!tenant.mpAccessToken || !tenant.mpRefreshToken) {
    throw new Error("Tenant sin cuenta de Mercado Pago conectada");
  }

  try {
    return await llamada(descifrar(tenant.mpAccessToken));
  } catch (e) {
    const esErrorDeAuth = e instanceof Error && /\(401\)/.test(e.message);
    if (!esErrorDeAuth) throw e;

    const accessTokenRenovado = await refrescarYGuardarToken(tenant.id, tenant.mpRefreshToken);
    return llamada(accessTokenRenovado);
  }
}

export function crearPreferenciaParaTenant(
  tenant: Pick<Tenant, "id" | "mpAccessToken" | "mpRefreshToken">,
  datos: { titulo: string; monto: number; externalReference: string; notificationUrl: string },
): Promise<PreferenciaMP> {
  return conAccessTokenTenant(tenant, (accessToken) => crearPreferencia(accessToken, datos));
}

export function consultarPagoParaTenant(
  tenant: Pick<Tenant, "id" | "mpAccessToken" | "mpRefreshToken">,
  paymentId: string,
): Promise<PagoMP> {
  return conAccessTokenTenant(tenant, (accessToken) => consultarPago(accessToken, paymentId));
}
