import { Worker } from "bullmq";
import { JobSecuencia, NOMBRE_COLA_SECUENCIA, redisConnection } from "../lib/queue";
import { prisma } from "../lib/prisma";
import { textoPorPaso, TIPO_POR_PASO } from "../services/plantillas";
import { asegurarPreferencia, linkDePago } from "../services/preferencias";

export function iniciarSecuenciaWorker(): Worker<JobSecuencia> {
  const worker = new Worker<JobSecuencia>(
    NOMBRE_COLA_SECUENCIA,
    async (job) => {
      const { deudaId, paso } = job.data;

      const deuda = await prisma.deuda.findUnique({
        where: { id: deudaId },
        include: { cliente: true, tenant: true },
      });

      // Se relee el estado antes de actuar: si ya no está en_secuencia (pausada,
      // cobrada, o el cliente respondió) o si este paso ya se envió, se descarta
      // silenciosamente. Esto hace el sistema robusto ante race conditions.
      if (!deuda || deuda.estado !== "en_secuencia" || deuda.pasoSecuencia >= paso) {
        return;
      }

      const mpPreferenceId = await asegurarPreferencia(deuda, deuda.tenant);

      const vocabulario = deuda.tenant.vocabulario as { unidad: string; persona: string };
      const contenido = textoPorPaso(paso, {
        negocio: deuda.tenant.nombre,
        clienteNombre: deuda.cliente.nombre,
        unidad: vocabulario.unidad,
        concepto: deuda.concepto,
        monto: deuda.monto.toString(),
        link: mpPreferenceId ? linkDePago(mpPreferenceId) : null,
      });

      await prisma.$transaction([
        prisma.deuda.update({ where: { id: deuda.id }, data: { pasoSecuencia: paso } }),
        prisma.mensaje.create({
          data: {
            tenantId: deuda.tenantId,
            deudaId: deuda.id,
            direccion: "saliente",
            tipo: TIPO_POR_PASO[paso],
            contenido,
          },
        }),
      ]);
    },
    { connection: redisConnection },
  );

  worker.on("failed", (job, err) => {
    console.error(`Job de secuencia falló (deuda ${job?.data.deudaId}, paso ${job?.data.paso}):`, err);
  });

  return worker;
}
