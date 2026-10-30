import cron from "node-cron";
import { inicioDelDiaUTC } from "../lib/horario";
import { prisma } from "../lib/prisma";
import { iniciarSecuencia } from "../services/secuencia";

/** Busca deudas pendientes vencidas hasta hoy y las pasa a en_secuencia. */
export async function procesarVencimientosDeHoy(): Promise<number> {
  const hoy = inicioDelDiaUTC(new Date());
  const deudas = await prisma.deuda.findMany({
    where: { estado: "pendiente", vencimiento: { lte: hoy } },
  });

  for (const deuda of deudas) {
    await iniciarSecuencia(deuda);
  }
  return deudas.length;
}

/** Corre todos los días a las 9:00 hora Argentina (horario de envío, §5). */
export function iniciarCronVencimientos(): void {
  cron.schedule(
    "0 9 * * *",
    () => {
      procesarVencimientosDeHoy().catch((e) => console.error("Error en cron de vencimientos:", e));
    },
    { timezone: "America/Argentina/Buenos_Aires" },
  );
}
