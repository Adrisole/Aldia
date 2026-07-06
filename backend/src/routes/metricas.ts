import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";

export const metricasRouter = Router();
metricasRouter.use(requireAuth);

metricasRouter.get("/", async (req, res) => {
  const mes = typeof req.query.mes === "string" ? req.query.mes : undefined;
  const ahora = new Date();
  const [anio, mesNum] = (mes ?? `${ahora.getUTCFullYear()}-${ahora.getUTCMonth() + 1}`)
    .split("-")
    .map(Number);

  const deudas = await prisma.deuda.findMany({
    where: {
      tenantId: req.auth!.tenantId,
      vencimiento: {
        gte: new Date(Date.UTC(anio, mesNum - 1, 1)),
        lt: new Date(Date.UTC(anio, mesNum, 1)),
      },
    },
    select: { monto: true, estado: true },
  });

  const recuperado = deudas
    .filter((d) => d.estado === "cobrada")
    .reduce((acc, d) => acc + Number(d.monto), 0);
  const enGestion = deudas
    .filter((d) => d.estado !== "cobrada")
    .reduce((acc, d) => acc + Number(d.monto), 0);
  const cobradas = deudas.filter((d) => d.estado === "cobrada").length;
  const tasa = deudas.length > 0 ? Math.round((cobradas / deudas.length) * 100) : 0;

  res.json({ recuperado, enGestion, tasa, totalDeudas: deudas.length });
});
