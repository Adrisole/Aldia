import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import { generarNumeroRecibo } from "../lib/recibos";
import { cancelarPendientes, programarPendientes } from "../services/secuencia";

export const deudasRouter = Router();
deudasRouter.use(requireAuth);

function rangoDelMes(mes: string): { gte: Date; lt: Date } {
  const [anio, mesNum] = mes.split("-").map(Number);
  return {
    gte: new Date(Date.UTC(anio, mesNum - 1, 1)),
    lt: new Date(Date.UTC(anio, mesNum, 1)),
  };
}

deudasRouter.get("/deudas", async (req, res) => {
  const { estado, mes } = req.query;
  const where: Record<string, unknown> = { tenantId: req.auth!.tenantId };
  if (typeof estado === "string") where.estado = estado;
  if (typeof mes === "string") where.vencimiento = rangoDelMes(mes);

  const deudas = await prisma.deuda.findMany({
    where,
    include: { cliente: true },
    orderBy: { vencimiento: "asc" },
  });
  res.json({ deudas });
});

deudasRouter.post("/deudas", async (req, res) => {
  const { clienteId, concepto, monto, vencimiento } = req.body ?? {};
  if (typeof clienteId !== "string" || typeof concepto !== "string" || typeof monto !== "number" || !vencimiento) {
    return res.status(400).json({ error: "clienteId, concepto, monto y vencimiento son requeridos" });
  }

  const cliente = await prisma.cliente.findFirst({
    where: { id: clienteId, tenantId: req.auth!.tenantId },
  });
  if (!cliente) {
    return res.status(404).json({ error: "Cliente no encontrado" });
  }

  const deuda = await prisma.deuda.create({
    data: {
      tenantId: req.auth!.tenantId,
      clienteId,
      concepto,
      monto,
      vencimiento: new Date(vencimiento),
    },
  });
  res.status(201).json({ deuda });
});

async function buscarDeuda(tenantId: string, id: string) {
  return prisma.deuda.findFirst({ where: { id, tenantId } });
}

deudasRouter.post("/deudas/:id/pausar", async (req, res) => {
  const deuda = await buscarDeuda(req.auth!.tenantId, req.params.id);
  if (!deuda) return res.status(404).json({ error: "Deuda no encontrada" });
  if (deuda.estado === "cobrada") {
    return res.status(409).json({ error: "La deuda ya está cobrada" });
  }
  if (deuda.estado === "pausada") {
    return res.json({ deuda });
  }

  const [actualizada] = await prisma.$transaction([
    prisma.deuda.update({ where: { id: deuda.id }, data: { estado: "pausada" } }),
    prisma.mensaje.create({
      data: {
        tenantId: deuda.tenantId,
        deudaId: deuda.id,
        direccion: "sistema",
        tipo: "sistema",
        contenido: "Secuencia pausada por el negocio",
      },
    }),
  ]);
  await cancelarPendientes(deuda.id);
  res.json({ deuda: actualizada });
});

deudasRouter.post("/deudas/:id/reanudar", async (req, res) => {
  const deuda = await buscarDeuda(req.auth!.tenantId, req.params.id);
  if (!deuda) return res.status(404).json({ error: "Deuda no encontrada" });
  if (deuda.estado !== "pausada") {
    return res.status(409).json({ error: "La deuda no está pausada" });
  }

  const [actualizada] = await prisma.$transaction([
    prisma.deuda.update({ where: { id: deuda.id }, data: { estado: "en_secuencia" } }),
    prisma.mensaje.create({
      data: {
        tenantId: deuda.tenantId,
        deudaId: deuda.id,
        direccion: "sistema",
        tipo: "sistema",
        contenido: "Secuencia reanudada",
      },
    }),
  ]);
  await programarPendientes(actualizada);
  res.json({ deuda: actualizada });
});

deudasRouter.post("/deudas/:id/pago-manual", async (req, res) => {
  const { medio } = req.body ?? {};
  if (medio !== "transferencia" && medio !== "efectivo") {
    return res.status(400).json({ error: "medio debe ser 'transferencia' o 'efectivo'" });
  }

  const deuda = await buscarDeuda(req.auth!.tenantId, req.params.id);
  if (!deuda) return res.status(404).json({ error: "Deuda no encontrada" });
  if (deuda.estado === "cobrada") {
    return res.status(409).json({ error: "La deuda ya está cobrada" });
  }

  const resultado = await prisma.$transaction(async (tx) => {
    const actualizada = await tx.deuda.update({
      where: { id: deuda.id },
      data: { estado: "cobrada" },
    });

    const numeroRecibo = await generarNumeroRecibo(tx, deuda.tenantId);
    const cobro = await tx.cobro.create({
      data: {
        tenantId: deuda.tenantId,
        deudaId: deuda.id,
        numeroRecibo,
        monto: deuda.monto,
        medio,
        via: "manual",
      },
    });

    await tx.mensaje.create({
      data: {
        tenantId: deuda.tenantId,
        deudaId: deuda.id,
        direccion: "sistema",
        tipo: "sistema",
        contenido: `Pago acreditado por ${medio} · secuencia finalizada`,
      },
    });
    await tx.mensaje.create({
      data: {
        tenantId: deuda.tenantId,
        deudaId: deuda.id,
        direccion: "saliente",
        tipo: "recibo",
        contenido: `Recibimos tu pago. Gracias.\n\nRecibo ${numeroRecibo}\n${deuda.concepto}\nMedio: ${medio}\n\nGuardá este mensaje como comprobante.`,
      },
    });

    return { deuda: actualizada, cobro };
  });

  await cancelarPendientes(deuda.id);
  res.json(resultado);
});

deudasRouter.get("/deudas/:id/mensajes", async (req, res) => {
  const deuda = await buscarDeuda(req.auth!.tenantId, req.params.id);
  if (!deuda) return res.status(404).json({ error: "Deuda no encontrada" });

  const mensajes = await prisma.mensaje.findMany({
    where: { deudaId: deuda.id },
    orderBy: { creadoEn: "asc" },
  });
  res.json({ mensajes });
});
