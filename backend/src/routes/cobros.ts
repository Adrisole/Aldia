import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";

export const cobrosRouter = Router();
cobrosRouter.use(requireAuth);

cobrosRouter.get("/cobros", async (req, res) => {
  const { mes } = req.query;
  const where: Record<string, unknown> = { tenantId: req.auth!.tenantId };

  if (typeof mes === "string") {
    const [anio, mesNum] = mes.split("-").map(Number);
    where.cobradoEn = {
      gte: new Date(Date.UTC(anio, mesNum - 1, 1)),
      lt: new Date(Date.UTC(anio, mesNum, 1)),
    };
  }

  const cobros = await prisma.cobro.findMany({
    where,
    include: { deuda: { include: { cliente: true } } },
    orderBy: { cobradoEn: "desc" },
  });
  res.json({ cobros });
});
