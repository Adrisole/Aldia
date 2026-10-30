import { Prisma, PrismaClient } from "@prisma/client";

type Tx = Prisma.TransactionClient | PrismaClient;

/**
 * Incrementa el contador atómicamente (UPDATE ... SET x = x + 1 es una sola
 * sentencia SQL, no hay race entre lectura y escritura) y devuelve el
 * correlativo formateado. Debe llamarse dentro de la misma transacción que
 * inserta el cobro.
 */
export async function generarNumeroRecibo(tx: Tx, tenantId: string): Promise<string> {
  const tenant = await tx.tenant.update({
    where: { id: tenantId },
    data: { contadorRecibos: { increment: 1 } },
    select: { contadorRecibos: true },
  });
  return `R-${String(tenant.contadorRecibos).padStart(4, "0")}`;
}
