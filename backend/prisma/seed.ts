import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Mapea los estados de demostración del prototipo a la máquina de estados de §5.
const ESTADO_A_MODELO: Record<string, { estado: string; paso: number }> = {
  aviso: { estado: "en_secuencia", paso: 1 },
  recordatorio: { estado: "en_secuencia", paso: 2 },
  ultimo: { estado: "en_secuencia", paso: 3 },
  respondio: { estado: "respondio_manual", paso: 0 },
  recuperada: { estado: "cobrada", paso: 0 },
  pausada: { estado: "pausada", paso: 0 },
};

function fechaJunio(dia: string): Date {
  const [d, m] = dia.split("/");
  return new Date(Date.UTC(2026, Number(m) - 1, Number(d)));
}

interface DeudaSeed {
  nombre: string;
  concepto: string;
  monto: number;
  vence: string;
  estado: keyof typeof ESTADO_A_MODELO;
}

interface CobroSeed {
  numeroRecibo: string;
  nombre: string;
  concepto: string;
  monto: number;
  medio: string;
  via: string;
  // Si no hay deuda asociada en `deudas`, se crea una deuda ya cobrada para sostener la FK.
  deudaVence: string;
}

interface TenantSeed {
  nombre: string;
  rubro: string;
  vocabulario: { unidad: string; persona: string };
  adminEmail: string;
  deudas: DeudaSeed[];
  cobros: CobroSeed[];
}

const TENANTS: TenantSeed[] = [
  {
    nombre: "Energía Fitness",
    rubro: "gimnasio",
    vocabulario: { unidad: "cuota", persona: "alumno" },
    adminEmail: "admin@energiafitness.com.ar",
    deudas: [
      { nombre: "Martín Aguirre", concepto: "Cuota junio", monto: 45000, vence: "01/06", estado: "ultimo" },
      { nombre: "Carla Benítez", concepto: "Cuota junio", monto: 45000, vence: "05/06", estado: "respondio" },
      { nombre: "Diego Sosa", concepto: "Cuota junio", monto: 45000, vence: "10/06", estado: "recuperada" },
      { nombre: "Lucía Fernández", concepto: "Cuota julio", monto: 45000, vence: "01/07", estado: "aviso" },
      { nombre: "Roberto Kim", concepto: "Cuota junio", monto: 45000, vence: "15/06", estado: "recordatorio" },
      { nombre: "Valentina Ríos", concepto: "Cuota junio", monto: 45000, vence: "03/06", estado: "recuperada" },
    ],
    cobros: [
      { numeroRecibo: "R-0148", nombre: "Diego Sosa", concepto: "Cuota junio", monto: 45000, medio: "mercado_pago", via: "automatico", deudaVence: "10/06" },
      { numeroRecibo: "R-0147", nombre: "Valentina Ríos", concepto: "Cuota junio", monto: 45000, medio: "mercado_pago", via: "automatico", deudaVence: "03/06" },
      { numeroRecibo: "R-0146", nombre: "Pablo Duarte", concepto: "Cuota mayo", monto: 45000, medio: "transferencia", via: "manual", deudaVence: "02/06" },
    ],
  },
  {
    nombre: "Del Valle Propiedades",
    rubro: "inmobiliaria",
    vocabulario: { unidad: "alquiler", persona: "inquilino" },
    adminEmail: "admin@delvallepropiedades.com.ar",
    deudas: [
      { nombre: "Familia Gutiérrez", concepto: "Alquiler junio · Bolívar 1420 3°B", monto: 680000, vence: "10/06", estado: "ultimo" },
      { nombre: "Marcos Leiva", concepto: "Alquiler junio · San Lorenzo 855 PB", monto: 520000, vence: "05/06", estado: "recuperada" },
      { nombre: "Estudio Roca (local)", concepto: "Alquiler junio · Córdoba 2210 local 4", monto: 950000, vence: "10/06", estado: "respondio" },
      { nombre: "Ana Paredes", concepto: "Alquiler julio · Mitre 340 5°A", monto: 610000, vence: "01/07", estado: "aviso" },
      { nombre: "Jorge Insaurralde", concepto: "Alquiler junio · Ayacucho 1180 1°C", monto: 590000, vence: "10/06", estado: "recuperada" },
    ],
    cobros: [
      { numeroRecibo: "R-0093", nombre: "Jorge Insaurralde", concepto: "Alquiler junio · Ayacucho 1180 1°C", monto: 590000, medio: "mercado_pago", via: "automatico", deudaVence: "10/06" },
      { numeroRecibo: "R-0092", nombre: "Marcos Leiva", concepto: "Alquiler junio · San Lorenzo 855 PB", monto: 520000, medio: "mercado_pago", via: "automatico", deudaVence: "05/06" },
      { numeroRecibo: "R-0091", nombre: "Silvia Ortega", concepto: "Alquiler mayo · Junín 725 2°A", monto: 480000, medio: "transferencia", via: "manual", deudaVence: "03/06" },
    ],
  },
];

async function main() {
  for (const t of TENANTS) {
    const tenant = await prisma.tenant.create({
      data: {
        nombre: t.nombre,
        rubro: t.rubro,
        vocabulario: t.vocabulario,
        mpConectado: true,
      },
    });

    await prisma.usuario.create({
      data: {
        tenantId: tenant.id,
        email: t.adminEmail,
        passwordHash: await bcrypt.hash("aldia1234", 10),
      },
    });

    // Un cliente por nombre (evita duplicar al mismo deudor entre `deudas` y `cobros`).
    const clientesPorNombre = new Map<string, string>();
    async function obtenerClienteId(nombre: string): Promise<string> {
      const existente = clientesPorNombre.get(nombre);
      if (existente) return existente;
      const cliente = await prisma.cliente.create({
        data: { tenantId: tenant.id, nombre },
      });
      clientesPorNombre.set(nombre, cliente.id);
      return cliente.id;
    }

    const deudaPorClave = new Map<string, string>();

    for (const d of t.deudas) {
      const clienteId = await obtenerClienteId(d.nombre);
      const { estado, paso } = ESTADO_A_MODELO[d.estado];
      const deuda = await prisma.deuda.create({
        data: {
          tenantId: tenant.id,
          clienteId,
          concepto: d.concepto,
          monto: d.monto,
          vencimiento: fechaJunio(d.vence),
          estado,
          pasoSecuencia: paso,
        },
      });
      deudaPorClave.set(`${d.nombre}|${d.vence}`, deuda.id);
    }

    for (const c of t.cobros) {
      const clave = `${c.nombre}|${c.deudaVence}`;
      let deudaId = deudaPorClave.get(clave);

      if (!deudaId) {
        // Cobro histórico sin deuda correspondiente en la lista de demo: se crea ya cobrada.
        const clienteId = await obtenerClienteId(c.nombre);
        const deuda = await prisma.deuda.create({
          data: {
            tenantId: tenant.id,
            clienteId,
            concepto: c.concepto,
            monto: c.monto,
            vencimiento: fechaJunio(c.deudaVence),
            estado: "cobrada",
          },
        });
        deudaId = deuda.id;
        deudaPorClave.set(clave, deudaId);
      }

      await prisma.cobro.create({
        data: {
          tenantId: tenant.id,
          deudaId,
          numeroRecibo: c.numeroRecibo,
          monto: c.monto,
          medio: c.medio,
          via: c.via,
          reciboEnviadoWa: true,
        },
      });
    }

    console.log(`Sembrado: ${t.nombre} (${t.deudas.length} deudas, ${t.cobros.length} cobros)`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
