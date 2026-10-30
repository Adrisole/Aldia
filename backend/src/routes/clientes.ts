import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";

export const clientesRouter = Router();
clientesRouter.use(requireAuth);

clientesRouter.get("/", async (req, res) => {
  const clientes = await prisma.cliente.findMany({
    where: { tenantId: req.auth!.tenantId },
    orderBy: { nombre: "asc" },
  });
  res.json({ clientes });
});

clientesRouter.post("/", async (req, res) => {
  const { nombre, whatsapp, email, referencia } = req.body ?? {};
  if (typeof nombre !== "string" || !nombre.trim()) {
    return res.status(400).json({ error: "nombre es requerido" });
  }

  const cliente = await prisma.cliente.create({
    data: {
      tenantId: req.auth!.tenantId,
      nombre,
      whatsapp: whatsapp ?? null,
      email: email ?? null,
      referencia: referencia ?? null,
    },
  });
  res.status(201).json({ cliente });
});

clientesRouter.put("/:id", async (req, res) => {
  const { nombre, whatsapp, email, referencia, activo } = req.body ?? {};

  const existente = await prisma.cliente.findFirst({
    where: { id: req.params.id, tenantId: req.auth!.tenantId },
  });
  if (!existente) {
    return res.status(404).json({ error: "Cliente no encontrado" });
  }

  const cliente = await prisma.cliente.update({
    where: { id: existente.id },
    data: {
      nombre: nombre ?? undefined,
      whatsapp: whatsapp ?? undefined,
      email: email ?? undefined,
      referencia: referencia ?? undefined,
      activo: typeof activo === "boolean" ? activo : undefined,
    },
  });
  res.json({ cliente });
});
