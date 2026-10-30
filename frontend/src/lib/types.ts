export interface Tenant {
  id: string;
  nombre: string;
  rubro: string;
  vocabulario: { unidad: string; persona: string };
  mpConectado: boolean;
  plan: string;
  logoUrl?: string | null;
  emailRespaldo?: string | null;
}

export interface Cliente {
  id: string;
  nombre: string;
  whatsapp: string | null;
  email: string | null;
  referencia: string | null;
  activo: boolean;
}

export interface Deuda {
  id: string;
  concepto: string;
  monto: string;
  vencimiento: string;
  estado: "pendiente" | "en_secuencia" | "respondio_manual" | "pausada" | "cobrada" | "incobrable";
  pasoSecuencia: number;
  cliente: Cliente;
}

export interface Mensaje {
  id: string;
  direccion: "saliente" | "entrante" | "sistema";
  tipo: string;
  contenido: string;
  creadoEn: string;
}

export interface Cobro {
  id: string;
  numeroRecibo: string;
  monto: string;
  medio: string;
  via: string;
  cobradoEn: string;
  deuda: Deuda;
}

export interface Metricas {
  recuperado: number;
  enGestion: number;
  tasa: number;
  totalDeudas: number;
}
