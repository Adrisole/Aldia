import { PasoSecuencia } from "../lib/queue";

const fmt = (n: number | string) => "$" + Number(n).toLocaleString("es-AR", { maximumFractionDigits: 0 });

export const TIPO_POR_PASO: Record<PasoSecuencia, string> = {
  1: "aviso_1",
  2: "recordatorio_2",
  3: "ultimo_3",
};

interface DatosMensaje {
  negocio: string;
  clienteNombre: string;
  unidad: string;
  concepto: string;
  monto: number | string;
  link: string | null;
}

// Sin WhatsApp real todavía (Fase 5): estos textos solo se loguean en `mensajes`.
export function textoPorPaso(paso: PasoSecuencia, d: DatosMensaje): string {
  const lineaLink = d.link ? `\n${d.link}` : "";
  switch (paso) {
    case 1:
      return `Hola ${d.clienteNombre}, te escribimos de ${d.negocio}. Tu ${d.unidad} "${d.concepto}" (${fmt(d.monto)}) venció hoy.${lineaLink}`;
    case 2:
      return `Hola ${d.clienteNombre}, te recordamos que tu ${d.unidad} "${d.concepto}" de ${d.negocio} sigue pendiente.${lineaLink}`;
    case 3:
      return `${d.clienteNombre}, este es el último recordatorio automático de ${d.negocio} por tu ${d.unidad} "${d.concepto}". Si ya la abonaste o querés hablar con nosotros, respondé este mensaje.`;
  }
}
