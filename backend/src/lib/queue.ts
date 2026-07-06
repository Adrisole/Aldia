import { Queue } from "bullmq";

const redisUrl = new URL(process.env.REDIS_URL ?? "redis://localhost:6379");

// Se pasa como objeto de opciones (no como instancia de ioredis) porque bullmq
// trae su propia copia de ioredis y una instancia externa puede no coincidir
// de tipos entre versiones.
export const redisConnection = {
  host: redisUrl.hostname,
  port: Number(redisUrl.port) || 6379,
  password: redisUrl.password || undefined,
  maxRetriesPerRequest: null as null,
};

export const NOMBRE_COLA_SECUENCIA = "secuencia";

export const secuenciaQueue = new Queue(NOMBRE_COLA_SECUENCIA, {
  connection: redisConnection,
});

export type PasoSecuencia = 1 | 2 | 3;

export interface JobSecuencia {
  deudaId: string;
  paso: PasoSecuencia;
}

export function jobIdPaso(deudaId: string, paso: PasoSecuencia): string {
  return `deuda-${deudaId}-paso-${paso}`;
}
