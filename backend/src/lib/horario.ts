// America/Argentina/Buenos_Aires no observa horario de verano desde 2009: offset fijo UTC-3.
const OFFSET_ARGENTINA_HORAS = -3;

/** 9:00 hora Argentina del día de `fecha`, expresado en UTC (9 - (-3) = 12:00 UTC). */
export function nueveAM(fecha: Date): Date {
  return new Date(
    Date.UTC(fecha.getUTCFullYear(), fecha.getUTCMonth(), fecha.getUTCDate(), 9 - OFFSET_ARGENTINA_HORAS, 0, 0, 0),
  );
}

export function sumarDias(fecha: Date, dias: number): Date {
  const resultado = new Date(fecha);
  resultado.setUTCDate(resultado.getUTCDate() + dias);
  return resultado;
}

/** Milisegundos de delay para BullMQ hasta `fecha` (nunca negativo). */
export function delayHasta(fecha: Date): number {
  return Math.max(0, fecha.getTime() - Date.now());
}

export function inicioDelDiaUTC(fecha: Date): Date {
  return new Date(Date.UTC(fecha.getUTCFullYear(), fecha.getUTCMonth(), fecha.getUTCDate()));
}
