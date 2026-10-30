import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import { cifrar } from "../lib/crypto";
import { intercambiarCodigo, urlAutorizacion } from "../lib/mercadopago";
import { firmarState, verificarState } from "../services/mpOauth";

export const mpOauthRouter = Router();

const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://localhost:5173";

// Devuelve la URL de autorización (no redirige el propio backend: nuestra auth
// es por JWT en header, no por cookie de sesión, así que el frontend hace el
// fetch autenticado acá y recién después navega el browser a `url`).
mpOauthRouter.get("/mp/oauth/iniciar", requireAuth, async (req, res) => {
  const state = firmarState(req.auth!.tenantId);
  res.json({ url: urlAutorizacion(state) });
});

// Este sí lo pega Mercado Pago directo en el navegador del usuario (sin
// Authorization header): el tenant se identifica a través del `state` firmado.
mpOauthRouter.get("/mp/oauth/callback", async (req, res) => {
  const { code, state } = req.query;

  if (typeof code !== "string" || typeof state !== "string") {
    return res.redirect(`${FRONTEND_URL}/?mp=error`);
  }

  const tenantId = verificarState(state);
  if (!tenantId) {
    return res.redirect(`${FRONTEND_URL}/?mp=error`);
  }

  try {
    const token = await intercambiarCodigo(code);
    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        mpUserId: String(token.user_id),
        mpAccessToken: cifrar(token.access_token),
        mpRefreshToken: cifrar(token.refresh_token),
        mpConectado: true,
      },
    });
    res.redirect(`${FRONTEND_URL}/?mp=conectado`);
  } catch (e) {
    console.error("Error en callback de OAuth de MP:", e);
    res.redirect(`${FRONTEND_URL}/?mp=error`);
  }
});
