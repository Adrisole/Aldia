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

interface ChatSeed {
  de: "bot" | "cliente" | "sistema";
  texto: string;
}

interface DeudaSeed {
  nombre: string;
  concepto: string;
  monto: number;
  vence: string;
  estado: keyof typeof ESTADO_A_MODELO;
  chat: ChatSeed[];
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
      {
        nombre: "Martín Aguirre", concepto: "Cuota junio", monto: 45000, vence: "01/06", estado: "ultimo",
        chat: [
          { de: "bot", texto: "Hola Martín, Soy el asistente de Energía Fitness. Tu cuota de junio ($45.000) venció hoy. Podés abonarla desde acá:\nmpago.la/energia-fit" },
          { de: "bot", texto: "Hola Martín, te recordamos que tu cuota de junio sigue pendiente. El link de pago sigue activo.\nmpago.la/energia-fit" },
          { de: "bot", texto: "Martín, este es el último recordatorio automático por la cuota de junio. Si ya la abonaste o querés hablar con nosotros, respondé este mensaje y te atendemos." },
        ],
      },
      {
        nombre: "Carla Benítez", concepto: "Cuota junio", monto: 45000, vence: "05/06", estado: "respondio",
        chat: [
          { de: "bot", texto: "Hola Carla, Tu cuota de junio ($45.000) venció hoy. Podés abonarla desde acá:\nmpago.la/energia-fit" },
          { de: "cliente", texto: "Hola! La semana que viene cobro y la pago, puede ser?" },
          { de: "sistema", texto: "Secuencia pausada · pasó a atención manual" },
        ],
      },
      {
        nombre: "Diego Sosa", concepto: "Cuota junio", monto: 45000, vence: "10/06", estado: "recuperada",
        chat: [
          { de: "bot", texto: "Hola Diego, Tu cuota de junio ($45.000) venció hoy. Podés abonarla desde acá:\nmpago.la/energia-fit" },
          { de: "sistema", texto: "Pago acreditado por Mercado Pago · $45.000 · secuencia finalizada" },
        ],
      },
      {
        nombre: "Lucía Fernández", concepto: "Cuota julio", monto: 45000, vence: "01/07", estado: "aviso",
        chat: [
          { de: "bot", texto: "Hola Lucía, Tu cuota de julio ($45.000) venció ayer. Podés abonarla desde acá:\nmpago.la/energia-fit" },
        ],
      },
      {
        nombre: "Roberto Kim", concepto: "Cuota junio", monto: 45000, vence: "15/06", estado: "recordatorio",
        chat: [
          { de: "bot", texto: "Hola Roberto, Tu cuota de junio ($45.000) venció hoy. Podés abonarla desde acá:\nmpago.la/energia-fit" },
          { de: "bot", texto: "Hola Roberto, te recordamos que tu cuota de junio sigue pendiente.\nmpago.la/energia-fit" },
        ],
      },
      {
        nombre: "Valentina Ríos", concepto: "Cuota junio", monto: 45000, vence: "03/06", estado: "recuperada",
        chat: [
          { de: "bot", texto: "Hola Valentina, Tu cuota de junio ($45.000) venció hoy:\nmpago.la/energia-fit" },
          { de: "bot", texto: "Hola Valentina, tu cuota de junio sigue pendiente.\nmpago.la/energia-fit" },
          { de: "sistema", texto: "Pago acreditado por Mercado Pago · $45.000 · secuencia finalizada" },
        ],
      },
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
      {
        nombre: "Familia Gutiérrez", concepto: "Alquiler junio · Bolívar 1420 3°B", monto: 680000, vence: "10/06", estado: "ultimo",
        chat: [
          { de: "bot", texto: "Les escribimos de Del Valle Propiedades. El alquiler de junio de Bolívar 1420 3°B ($680.000) venció hoy. Pueden abonarlo desde acá:\nmpago.la/delvalle-prop" },
          { de: "bot", texto: "Les recordamos que el alquiler de junio sigue pendiente. El link de pago continúa activo.\nmpago.la/delvalle-prop" },
          { de: "bot", texto: "Este es el último recordatorio automático por el alquiler de junio. Si ya lo abonaron o quieren coordinar, respondan este mensaje y los atendemos." },
        ],
      },
      {
        nombre: "Marcos Leiva", concepto: "Alquiler junio · San Lorenzo 855 PB", monto: 520000, vence: "05/06", estado: "recuperada",
        chat: [
          { de: "bot", texto: "Hola Marcos, El alquiler de junio de San Lorenzo 855 PB ($520.000) venció hoy:\nmpago.la/delvalle-prop" },
          { de: "sistema", texto: "Pago acreditado por Mercado Pago · $520.000 · secuencia finalizada" },
        ],
      },
      {
        nombre: "Estudio Roca (local)", concepto: "Alquiler junio · Córdoba 2210 local 4", monto: 950000, vence: "10/06", estado: "respondio",
        chat: [
          { de: "bot", texto: "Buenas, el alquiler de junio del local de Córdoba 2210 ($950.000) venció hoy:\nmpago.la/delvalle-prop" },
          { de: "cliente", texto: "Buenas, transferimos el viernes junto con expensas. Pasan CBU actualizado?" },
          { de: "sistema", texto: "Secuencia pausada · pasó a atención manual" },
        ],
      },
      {
        nombre: "Ana Paredes", concepto: "Alquiler julio · Mitre 340 5°A", monto: 610000, vence: "01/07", estado: "aviso",
        chat: [
          { de: "bot", texto: "Hola Ana, El alquiler de julio de Mitre 340 5°A ($610.000) venció ayer:\nmpago.la/delvalle-prop" },
        ],
      },
      {
        nombre: "Jorge Insaurralde", concepto: "Alquiler junio · Ayacucho 1180 1°C", monto: 590000, vence: "10/06", estado: "recuperada",
        chat: [
          { de: "bot", texto: "Hola Jorge, El alquiler de junio de Ayacucho 1180 1°C ($590.000) venció hoy:\nmpago.la/delvalle-prop" },
          { de: "bot", texto: "Jorge, el alquiler de junio sigue pendiente:\nmpago.la/delvalle-prop" },
          { de: "sistema", texto: "Pago acreditado por Mercado Pago · $590.000 · secuencia finalizada" },
        ],
      },
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

    const TIPO_POR_DE_Y_PASO: Record<ChatSeed["de"], (paso: number) => { direccion: string; tipo: string }> = {
      bot: (paso) => ({
        direccion: "saliente",
        tipo: paso === 1 ? "aviso_1" : paso === 2 ? "recordatorio_2" : "ultimo_3",
      }),
      cliente: () => ({ direccion: "entrante", tipo: "respuesta_cliente" }),
      sistema: () => ({ direccion: "sistema", tipo: "sistema" }),
    };

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

      let pasoBot = 0;
      for (const m of d.chat) {
        if (m.de === "bot") pasoBot += 1;
        const { direccion, tipo } = TIPO_POR_DE_Y_PASO[m.de](pasoBot);
        await prisma.mensaje.create({
          data: {
            tenantId: tenant.id,
            deudaId: deuda.id,
            direccion,
            tipo,
            contenido: m.texto,
          },
        });
      }
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

    // El contador de recibos arranca donde termina el histórico sembrado,
    // para que el próximo recibo generado por la app no choque con estos.
    const maxRecibo = Math.max(...t.cobros.map((c) => Number(c.numeroRecibo.split("-")[1])));
    await prisma.tenant.update({
      where: { id: tenant.id },
      data: { contadorRecibos: maxRecibo },
    });

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
