const MP_API_BASE = process.env.MP_API_BASE ?? "https://api.mercadopago.com";

function env(nombre: string): string {
  const valor = process.env[nombre];
  if (!valor) throw new Error(`${nombre} no está configurado`);
  return valor;
}

export interface TokenMP {
  access_token: string;
  refresh_token: string;
  user_id: number;
  expires_in: number;
}

export function urlAutorizacion(state: string): string {
  const params = new URLSearchParams({
    client_id: env("MP_CLIENT_ID"),
    response_type: "code",
    platform_id: "mp",
    redirect_uri: env("MP_REDIRECT_URI"),
    state,
  });
  return `https://auth.mercadopago.com.ar/authorization?${params.toString()}`;
}

async function llamarOAuth(body: Record<string, string>): Promise<TokenMP> {
  const res = await fetch(`${MP_API_BASE}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`MP OAuth falló (${res.status}): ${await res.text()}`);
  }
  return res.json() as Promise<TokenMP>;
}

export function intercambiarCodigo(code: string): Promise<TokenMP> {
  return llamarOAuth({
    grant_type: "authorization_code",
    client_id: env("MP_CLIENT_ID"),
    client_secret: env("MP_CLIENT_SECRET"),
    code,
    redirect_uri: env("MP_REDIRECT_URI"),
  });
}

export function refrescarToken(refreshToken: string): Promise<TokenMP> {
  return llamarOAuth({
    grant_type: "refresh_token",
    client_id: env("MP_CLIENT_ID"),
    client_secret: env("MP_CLIENT_SECRET"),
    refresh_token: refreshToken,
  });
}

export interface PreferenciaMP {
  id: string;
  init_point: string;
}

export async function crearPreferencia(
  accessToken: string,
  datos: { titulo: string; monto: number; externalReference: string; notificationUrl: string },
): Promise<PreferenciaMP> {
  const res = await fetch(`${MP_API_BASE}/checkout/preferences`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      items: [{ title: datos.titulo, quantity: 1, unit_price: datos.monto, currency_id: "ARS" }],
      external_reference: datos.externalReference,
      notification_url: datos.notificationUrl,
    }),
  });
  if (!res.ok) {
    throw new Error(`MP crear preferencia falló (${res.status}): ${await res.text()}`);
  }
  return res.json() as Promise<PreferenciaMP>;
}

export interface PagoMP {
  id: number;
  status: string;
  external_reference: string | null;
  transaction_amount: number;
}

export async function consultarPago(accessToken: string, paymentId: string): Promise<PagoMP> {
  const res = await fetch(`${MP_API_BASE}/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    throw new Error(`MP consultar pago falló (${res.status}): ${await res.text()}`);
  }
  return res.json() as Promise<PagoMP>;
}
