import bcrypt from "bcrypt";
import { Router } from "express";
import { prisma } from "../lib/prisma";
import { firmarToken } from "../lib/jwt";
import { requireAuth } from "../middleware/auth";

export const authRouter = Router();

authRouter.post("/auth/login", async (req, res) => {
  const { email, password } = req.body ?? {};
  if (typeof email !== "string" || typeof password !== "string") {
    return res.status(400).json({ error: "Email y password son requeridos" });
  }

  const usuario = await prisma.usuario.findUnique({ where: { email } });
  if (!usuario || !(await bcrypt.compare(password, usuario.passwordHash))) {
    return res.status(401).json({ error: "Credenciales inválidas" });
  }

  const token = firmarToken({ userId: usuario.id, tenantId: usuario.tenantId });
  res.json({ token });
});

authRouter.get("/me", requireAuth, async (req, res) => {
  const tenant = await prisma.tenant.findUnique({ where: { id: req.auth!.tenantId } });
  if (!tenant) {
    return res.status(404).json({ error: "Tenant no encontrado" });
  }

  res.json({
    tenant: {
      id: tenant.id,
      nombre: tenant.nombre,
      rubro: tenant.rubro,
      vocabulario: tenant.vocabulario,
      mpConectado: tenant.mpConectado,
      plan: tenant.plan,
    },
  });
});
