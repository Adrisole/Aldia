import { Deuda } from "@prisma/client";
import { delayHasta, nueveAM, sumarDias } from "../lib/horario";
import { jobIdPaso, PasoSecuencia, secuenciaQueue } from "../lib/queue";
import { prisma } from "../lib/prisma";

function fechaEjecucionPaso(vencimiento: Date, paso: PasoSecuencia): Date {
  if (paso === 1) return new Date(); // día 0: inmediato
  const dias = paso === 2 ? 3 : 7;
  return nueveAM(sumarDias(vencimiento, dias));
}

async function encolarPaso(deuda: Pick<Deuda, "id" | "vencimiento">, paso: PasoSecuencia): Promise<void> {
  const runAt = fechaEjecucionPaso(deuda.vencimiento, paso);
  await secuenciaQueue.add(
    "procesar-paso",
    { deudaId: deuda.id, paso },
    {
      jobId: jobIdPaso(deuda.id, paso),
      delay: delayHasta(runAt),
      removeOnComplete: true,
      removeOnFail: true,
    },
  );
}

/** Transiciona una deuda pendiente a en_secuencia y encola sus 3 mensajes (§5). */
export async function iniciarSecuencia(deuda: Pick<Deuda, "id" | "vencimiento">): Promise<void> {
  await prisma.deuda.update({ where: { id: deuda.id }, data: { estado: "en_secuencia" } });
  await encolarPaso(deuda, 1);
  await encolarPaso(deuda, 2);
  await encolarPaso(deuda, 3);
}

/** Reprograma los pasos que todavía no se enviaron (usado al reanudar una secuencia pausada). */
export async function programarPendientes(deuda: Pick<Deuda, "id" | "vencimiento" | "pasoSecuencia">): Promise<void> {
  for (const paso of [1, 2, 3] as PasoSecuencia[]) {
    if (paso > deuda.pasoSecuencia) {
      await encolarPaso(deuda, paso);
    }
  }
}

/** Cancela cualquier job pendiente de la secuencia (pago, pausa). Best-effort: ignora si ya no existe. */
export async function cancelarPendientes(deudaId: string): Promise<void> {
  for (const paso of [1, 2, 3] as PasoSecuencia[]) {
    try {
      await secuenciaQueue.remove(jobIdPaso(deudaId, paso));
    } catch {
      // el job ya se procesó o no existe: no hay nada que cancelar
    }
  }
}
