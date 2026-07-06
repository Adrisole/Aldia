import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";

export const configRouter = Router();
configRouter.use(requireAuth);

configRouter.put("/config", async (req, res) => {
  const { nombre, logoUrl, emailRespaldo } = req.body ?? {};

  const tenant = await prisma.tenant.update({
    where: { id: req.auth!.tenantId },
    data: {
      nombre: nombre ?? undefined,
      logoUrl: logoUrl ?? undefined,
      emailRespaldo: emailRespaldo ?? undefined,
    },
  });

  res.json({
    tenant: {
      id: tenant.id,
      nombre: tenant.nombre,
      rubro: tenant.rubro,
      vocabulario: tenant.vocabulario,
      logoUrl: tenant.logoUrl,
      emailRespaldo: tenant.emailRespaldo,
      mpConectado: tenant.mpConectado,
      plan: tenant.plan,
    },
  });
});
