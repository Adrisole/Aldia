import { useState } from "react";

// ─── Datos de demostración ────────────────────────────────────────────────
const fmt = (n) =>
  "$" + n.toLocaleString("es-AR", { maximumFractionDigits: 0 });

const hoy = "Jueves 2 de julio";

const DATA_INICIAL = {
  gym: {
    negocio: "Energía Fitness",
    rubro: "Gimnasio",
    unidad: "cuota",
    persona: "alumno",
    config: {
      whatsapp: "+54 9 376 412-8830",
      email: "hola@energiafitness.com.ar",
      mpConectado: true,
      mpCuenta: "ENERGIA FITNESS SRL",
      inicial: "EF",
    },
    cobros: [
      { id: "R-0148", nombre: "Diego Sosa", concepto: "Cuota junio", monto: 45000, fecha: "10/06 · 11:20", medio: "Mercado Pago", via: "automático" },
      { id: "R-0147", nombre: "Valentina Ríos", concepto: "Cuota junio", monto: 45000, fecha: "06/06 · 18:05", medio: "Mercado Pago", via: "automático" },
      { id: "R-0146", nombre: "Pablo Duarte", concepto: "Cuota junio", monto: 45000, fecha: "02/06 · 10:40", medio: "Transferencia", via: "manual" },
    ],
    deudas: [
      {
        id: 1, nombre: "Martín Aguirre", concepto: "Cuota junio", monto: 45000,
        vence: "01/06", diasVencida: 31, estado: "ultimo",
        chat: [
          { de: "bot", hora: "01/06 · 09:00", texto: "Hola Martín, Soy el asistente de Energía Fitness. Tu cuota de junio ($45.000) venció hoy. Podés abonarla desde acá:\nmpago.la/energia-fit" },
          { de: "bot", hora: "04/06 · 10:15", texto: "Hola Martín, te recordamos que tu cuota de junio sigue pendiente. El link de pago sigue activo.\nmpago.la/energia-fit" },
          { de: "bot", hora: "08/06 · 09:30", texto: "Martín, este es el último recordatorio automático por la cuota de junio. Si ya la abonaste o querés hablar con nosotros, respondé este mensaje y te atendemos." },
        ],
      },
      {
        id: 2, nombre: "Carla Benítez", concepto: "Cuota junio", monto: 45000,
        vence: "05/06", diasVencida: 27, estado: "respondio",
        chat: [
          { de: "bot", hora: "05/06 · 09:00", texto: "Hola Carla, Tu cuota de junio ($45.000) venció hoy. Podés abonarla desde acá:\nmpago.la/energia-fit" },
          { de: "cliente", hora: "05/06 · 13:42", texto: "Hola! La semana que viene cobro y la pago, puede ser?" },
          { de: "sistema", hora: "", texto: "Secuencia pausada · pasó a atención manual" },
        ],
      },
      {
        id: 3, nombre: "Diego Sosa", concepto: "Cuota junio", monto: 45000,
        vence: "10/06", diasVencida: 22, estado: "recuperada",
        chat: [
          { de: "bot", hora: "10/06 · 09:00", texto: "Hola Diego, Tu cuota de junio ($45.000) venció hoy. Podés abonarla desde acá:\nmpago.la/energia-fit" },
          { de: "sistema", hora: "10/06 · 11:20", texto: "Pago acreditado por Mercado Pago · $45.000 · secuencia finalizada" },
        ],
      },
      {
        id: 4, nombre: "Lucía Fernández", concepto: "Cuota julio", monto: 45000,
        vence: "01/07", diasVencida: 1, estado: "aviso",
        chat: [
          { de: "bot", hora: "01/07 · 09:00", texto: "Hola Lucía, Tu cuota de julio ($45.000) venció ayer. Podés abonarla desde acá:\nmpago.la/energia-fit" },
        ],
      },
      {
        id: 5, nombre: "Roberto Kim", concepto: "Cuota junio", monto: 45000,
        vence: "15/06", diasVencida: 17, estado: "recordatorio",
        chat: [
          { de: "bot", hora: "15/06 · 09:00", texto: "Hola Roberto, Tu cuota de junio ($45.000) venció hoy. Podés abonarla desde acá:\nmpago.la/energia-fit" },
          { de: "bot", hora: "18/06 · 10:00", texto: "Hola Roberto, te recordamos que tu cuota de junio sigue pendiente.\nmpago.la/energia-fit" },
        ],
      },
      {
        id: 6, nombre: "Valentina Ríos", concepto: "Cuota junio", monto: 45000,
        vence: "03/06", diasVencida: 29, estado: "recuperada",
        chat: [
          { de: "bot", hora: "03/06 · 09:00", texto: "Hola Valentina, Tu cuota de junio ($45.000) venció hoy:\nmpago.la/energia-fit" },
          { de: "bot", hora: "06/06 · 10:00", texto: "Hola Valentina, tu cuota de junio sigue pendiente.\nmpago.la/energia-fit" },
          { de: "sistema", hora: "06/06 · 18:05", texto: "Pago acreditado por Mercado Pago · $45.000 · secuencia finalizada" },
        ],
      },
    ],
  },
  inmo: {
    negocio: "Del Valle Propiedades",
    rubro: "Inmobiliaria",
    unidad: "alquiler",
    persona: "inquilino",
    config: {
      whatsapp: "+54 9 376 455-2190",
      email: "administracion@delvallepropiedades.com.ar",
      mpConectado: true,
      mpCuenta: "DEL VALLE PROPIEDADES SA",
      inicial: "DV",
    },
    cobros: [
      { id: "R-0093", nombre: "Jorge Insaurralde", concepto: "Alquiler junio · Ayacucho 1180 1°C", monto: 590000, fecha: "14/06 · 09:12", medio: "Mercado Pago", via: "automático" },
      { id: "R-0092", nombre: "Marcos Leiva", concepto: "Alquiler junio · San Lorenzo 855 PB", monto: 520000, fecha: "05/06 · 16:40", medio: "Mercado Pago", via: "automático" },
      { id: "R-0091", nombre: "Silvia Ortega", concepto: "Alquiler junio · Junín 725 2°A", monto: 480000, fecha: "03/06 · 12:15", medio: "Transferencia", via: "manual" },
    ],
    deudas: [
      {
        id: 1, nombre: "Familia Gutiérrez", concepto: "Alquiler junio · Bolívar 1420 3°B", monto: 680000,
        vence: "10/06", diasVencida: 22, estado: "ultimo",
        chat: [
          { de: "bot", hora: "10/06 · 09:00", texto: "Les escribimos de Del Valle Propiedades. El alquiler de junio de Bolívar 1420 3°B ($680.000) venció hoy. Pueden abonarlo desde acá:\nmpago.la/delvalle-prop" },
          { de: "bot", hora: "13/06 · 10:00", texto: "Les recordamos que el alquiler de junio sigue pendiente. El link de pago continúa activo.\nmpago.la/delvalle-prop" },
          { de: "bot", hora: "17/06 · 09:30", texto: "Este es el último recordatorio automático por el alquiler de junio. Si ya lo abonaron o quieren coordinar, respondan este mensaje y los atendemos." },
        ],
      },
      {
        id: 2, nombre: "Marcos Leiva", concepto: "Alquiler junio · San Lorenzo 855 PB", monto: 520000,
        vence: "05/06", diasVencida: 27, estado: "recuperada",
        chat: [
          { de: "bot", hora: "05/06 · 09:00", texto: "Hola Marcos, El alquiler de junio de San Lorenzo 855 PB ($520.000) venció hoy:\nmpago.la/delvalle-prop" },
          { de: "sistema", hora: "05/06 · 16:40", texto: "Pago acreditado por Mercado Pago · $520.000 · secuencia finalizada" },
        ],
      },
      {
        id: 3, nombre: "Estudio Roca (local)", concepto: "Alquiler junio · Córdoba 2210 local 4", monto: 950000,
        vence: "10/06", diasVencida: 22, estado: "respondio",
        chat: [
          { de: "bot", hora: "10/06 · 09:00", texto: "Buenas, el alquiler de junio del local de Córdoba 2210 ($950.000) venció hoy:\nmpago.la/delvalle-prop" },
          { de: "cliente", hora: "10/06 · 12:10", texto: "Buenas, transferimos el viernes junto con expensas. Pasan CBU actualizado?" },
          { de: "sistema", hora: "", texto: "Secuencia pausada · pasó a atención manual" },
        ],
      },
      {
        id: 4, nombre: "Ana Paredes", concepto: "Alquiler julio · Mitre 340 5°A", monto: 610000,
        vence: "01/07", diasVencida: 1, estado: "aviso",
        chat: [
          { de: "bot", hora: "01/07 · 09:00", texto: "Hola Ana, El alquiler de julio de Mitre 340 5°A ($610.000) venció ayer:\nmpago.la/delvalle-prop" },
        ],
      },
      {
        id: 5, nombre: "Jorge Insaurralde", concepto: "Alquiler junio · Ayacucho 1180 1°C", monto: 590000,
        vence: "10/06", diasVencida: 22, estado: "recuperada",
        chat: [
          { de: "bot", hora: "10/06 · 09:00", texto: "Hola Jorge, El alquiler de junio de Ayacucho 1180 1°C ($590.000) venció hoy:\nmpago.la/delvalle-prop" },
          { de: "bot", hora: "13/06 · 10:00", texto: "Jorge, el alquiler de junio sigue pendiente:\nmpago.la/delvalle-prop" },
          { de: "sistema", hora: "14/06 · 09:12", texto: "Pago acreditado por Mercado Pago · $590.000 · secuencia finalizada" },
        ],
      },
    ],
  },
};

// ─── Estados de secuencia ─────────────────────────────────────────────────
const ESTADOS = {
  aviso:       { label: "Aviso enviado",      paso: 1, color: "#57534E", bg: "#F5F5F4" },
  recordatorio:{ label: "Recordatorio 2",     paso: 2, color: "#57534E", bg: "#F5F5F4" },
  ultimo:      { label: "Último aviso",       paso: 3, color: "#1C1917", bg: "#E7E5E4" },
  respondio:   { label: "Respondió · manual", paso: 0, color: "#57534E", bg: "#F5F5F4" },
  recuperada:  { label: "Recuperada",         paso: 4, color: "#047857", bg: "#D1FAE5" },
  pausada:     { label: "Pausada",            paso: 0, color: "#78716C", bg: "#F5F5F4" },
};

// ─── Componente principal ────────────────────────────────────────────────
export default function AlDia() {
  const [vertical, setVertical] = useState("gym");
  const [vista, setVista] = useState("deudas"); // "deudas" | "cobros"
  const [data, setData] = useState(DATA_INICIAL);
  const [selId, setSelId] = useState({ gym: 1, inmo: 1 });
  const [selCobro, setSelCobro] = useState({ gym: "R-0148", inmo: "R-0093" });

  const v = data[vertical];
  const deudas = v.deudas;
  const cobros = v.cobros;
  const sel = deudas.find((d) => d.id === selId[vertical]) || deudas[0];
  const recibo = cobros.find((c) => c.id === selCobro[vertical]) || cobros[0];

  const recuperado = deudas.filter((d) => d.estado === "recuperada").reduce((a, d) => a + d.monto, 0);
  const enGestion = deudas.filter((d) => d.estado !== "recuperada").reduce((a, d) => a + d.monto, 0);
  const tasa = Math.round((deudas.filter((d) => d.estado === "recuperada").length / deudas.length) * 100);
  const totalCobrado = cobros.reduce((a, c) => a + c.monto, 0);

  const setEstado = (id, estado, extraMsg) => {
    setData((prev) => {
      const copia = structuredClone(prev);
      const deuda = copia[vertical].deudas.find((d) => d.id === id);
      deuda.estado = estado;
      if (extraMsg) deuda.chat.push(extraMsg);
      return copia;
    });
  };

  const marcarPagada = (d) => {
    const nuevoId = "R-" + String(Math.max(...cobros.map((c) => parseInt(c.id.slice(2)))) + 1).padStart(4, "0");
    setData((prev) => {
      const copia = structuredClone(prev);
      const deuda = copia[vertical].deudas.find((x) => x.id === d.id);
      deuda.estado = "recuperada";
      deuda.chat.push({
        de: "sistema", hora: "hoy",
        texto: `Pago acreditado por Mercado Pago · ${fmt(d.monto)} · secuencia finalizada`,
      });
      deuda.chat.push({
        de: "bot", hora: "hoy",
        texto: `Recibimos tu pago. Gracias.\n\n*Recibo ${nuevoId}*\n${v.negocio}\n${d.concepto}: ${fmt(d.monto)}\nMedio: Mercado Pago\n\nGuardá este mensaje como comprobante.`,
      });
      copia[vertical].cobros.unshift({
        id: nuevoId, nombre: d.nombre, concepto: d.concepto, monto: d.monto,
        fecha: "hoy", medio: "Mercado Pago", via: "automático",
      });
      return copia;
    });
    setSelCobro((p) => ({ ...p, [vertical]: nuevoId }));
  };

  const togglePausa = (d) =>
    d.estado === "pausada"
      ? setEstado(d.id, "aviso", { de: "sistema", hora: "hoy", texto: "Secuencia reanudada" })
      : setEstado(d.id, "pausada", { de: "sistema", hora: "hoy", texto: "Secuencia pausada por el negocio" });

  return (
    <div className="min-h-screen" style={{ background: "#F5F4F0", fontFamily: "'Archivo', system-ui, sans-serif", color: "#1C1917" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700&family=Archivo+Black&display=swap');
        .num-hero { font-family: 'Archivo Black', 'Archivo', sans-serif; letter-spacing: -0.02em; }
        .fila:hover { background: #FAFAF8; }
        button:focus-visible, .fila:focus-visible { outline: 2px solid #047857; outline-offset: 2px; }
      `}</style>

      {/* ── Header ── */}
      <header className="border-b border-stone-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center gap-3 justify-between">
          <div className="flex items-baseline gap-2">
            <span className="num-hero text-xl" style={{ color: "#047857" }}>AlDía</span>
            <span className="text-xs text-stone-400 hidden sm:inline">cobranzas automáticas por WhatsApp</span>
          </div>
          {/* Selector de vertical: la demo del "motor único, dos pieles" */}
          <div className="flex rounded-full border border-stone-200 bg-stone-100 p-1 text-sm">
            {[["gym", "Gimnasio"], ["inmo", "Inmobiliaria"]].map(([k, label]) => (
              <button
                key={k}
                onClick={() => setVertical(k)}
                className={"px-3 py-1.5 rounded-full transition-colors " + (vertical === k ? "bg-white shadow-sm font-semibold" : "text-stone-500")}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-5">
        {/* ── Identidad del negocio ── */}
        <p className="text-xs uppercase tracking-widest text-stone-400 mb-1">{v.rubro} · {hoy}</p>
        <h1 className="text-2xl font-bold mb-4">{v.negocio}</h1>

        {/* ── Métricas héroe ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="rounded-2xl p-4 text-white sm:col-span-1" style={{ background: "#065F46" }}>
            <p className="text-xs uppercase tracking-wider opacity-80">Recuperado este mes</p>
            <p className="num-hero text-3xl mt-1">{fmt(recuperado)}</p>
            <p className="text-xs mt-1 opacity-80">sin que nadie levantara el teléfono</p>
          </div>
          <div className="rounded-2xl p-4 bg-white border border-stone-200">
            <p className="text-xs uppercase tracking-wider text-stone-400">En gestión</p>
            <p className="num-hero text-3xl mt-1" style={{ color: "#1C1917" }}>{fmt(enGestion)}</p>
            <p className="text-xs mt-1 text-stone-400">{deudas.filter((d) => d.estado !== "recuperada").length} {v.unidad}s con secuencia activa</p>
          </div>
          <div className="rounded-2xl p-4 bg-white border border-stone-200">
            <p className="text-xs uppercase tracking-wider text-stone-400">Tasa de recuperación</p>
            <p className="num-hero text-3xl mt-1" style={{ color: "#047857" }}>{tasa}%</p>
            <p className="text-xs mt-1 text-stone-400">de las deudas del mes ya cobradas</p>
          </div>
        </div>

        {/* ── Selector de vista ── */}
        <div className="flex gap-1 mb-4 border-b border-stone-200">
          {[["deudas", "Deudas"], ["cobros", "Cobros y recibos"], ["config", "Configuración"]].map(([k, label]) => (
            <button
              key={k}
              onClick={() => setVista(k)}
              className={"px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors " + (vista === k ? "border-current" : "border-transparent text-stone-400")}
              style={vista === k ? { color: "#047857", borderColor: "#047857" } : {}}
            >
              {label}
            </button>
          ))}
        </div>

        {vista === "deudas" && (
        <>
        {/* ── Panel principal: lista + conversación ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Lista de deudas */}
          <section className="lg:col-span-3 rounded-2xl bg-white border border-stone-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-stone-100 flex items-center justify-between">
              <h2 className="font-semibold">{vertical === "gym" ? "Cuotas del mes" : "Alquileres del mes"}</h2>
              <span className="text-xs text-stone-400">tocá una fila para ver la conversación</span>
            </div>
            <ul>
              {deudas.map((d) => {
                const e = ESTADOS[d.estado];
                const activa = d.id === sel.id;
                return (
                  <li key={d.id}>
                    <button
                      onClick={() => setSelId((p) => ({ ...p, [vertical]: d.id }))}
                      className={"fila w-full text-left px-4 py-3 border-b border-stone-100 flex items-center gap-3 " + (activa ? "bg-stone-50" : "")}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{d.nombre}</p>
                        <p className="text-xs text-stone-400 truncate">{d.concepto} · venció {d.vence}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-semibold">{fmt(d.monto)}</p>
                        <span className="inline-block text-xs px-2 py-0.5 rounded-full mt-0.5" style={{ color: e.color, background: e.bg }}>
                          {e.label}
                        </span>
                      </div>
                      {/* Progreso de secuencia: 3 avisos + pago */}
                      <div className="hidden sm:flex flex-col gap-1 shrink-0 pl-1" aria-hidden="true">
                        {[1, 2, 3, 4].map((p) => (
                          <span key={p} className="w-1.5 h-1.5 rounded-full"
                            style={{ background: e.paso >= p ? (p === 4 ? "#047857" : "#78716C") : "#E7E5E4" }} />
                        ))}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* Conversación WhatsApp */}
          <section className="lg:col-span-2 rounded-2xl bg-white border border-stone-200 overflow-hidden flex flex-col">
            <div className="px-4 py-3 flex items-center gap-3" style={{ background: "#075E54", color: "white" }}>
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
                {sel.nombre.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">{sel.nombre}</p>
                <p className="text-xs opacity-75 truncate">{sel.concepto}</p>
              </div>
            </div>
            <div className="flex-1 p-3 space-y-2 overflow-y-auto" style={{ background: "#ECE5DD", minHeight: "260px", maxHeight: "340px" }}>
              {sel.chat.map((m, i) =>
                m.de === "sistema" ? (
                  <p key={i} className="text-center text-xs text-stone-500 bg-white/70 rounded-full px-3 py-1 mx-auto w-fit">
                    {m.texto}
                  </p>
                ) : (
                  <div key={i} className={"max-w-[85%] rounded-xl px-3 py-2 text-sm whitespace-pre-line shadow-sm " + (m.de === "bot" ? "ml-auto" : "mr-auto bg-white")}
                    style={m.de === "bot" ? { background: "#DCF8C6" } : {}}>
                    {m.texto}
                    <p className="text-right text-[10px] text-stone-400 mt-1">{m.hora}</p>
                  </div>
                )
              )}
            </div>
            {sel.estado !== "recuperada" && (
              <div className="p-3 border-t border-stone-100 flex gap-2">
                <button onClick={() => togglePausa(sel)}
                  className="flex-1 text-sm px-3 py-2 rounded-xl border border-stone-200 bg-white font-medium hover:bg-stone-50">
                  {sel.estado === "pausada" ? "Reanudar secuencia" : "Pausar secuencia"}
                </button>
                <button onClick={() => marcarPagada(sel)}
                  className="flex-1 text-sm px-3 py-2 rounded-xl text-white font-medium" style={{ background: "#047857" }}>
                  Registrar pago
                </button>
              </div>
            )}
          </section>
        </div>
        </>
        )}

        {vista === "config" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Identidad del negocio */}
          <section className="rounded-2xl bg-white border border-stone-200 p-4">
            <h2 className="font-semibold mb-1">Identidad del negocio</h2>
            <p className="text-xs text-stone-400 mb-4">Esto aparece en cada mensaje y en cada recibo que reciben tus clientes.</p>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold shrink-0" style={{ background: "#065F46" }}>
                {v.config.inicial}
              </div>
              <div>
                <button className="text-sm px-3 py-1.5 rounded-xl border border-stone-200 bg-white font-medium hover:bg-stone-50">
                  Subir logo
                </button>
                <p className="text-[11px] text-stone-400 mt-1">PNG o JPG · fondo claro recomendado</p>
              </div>
            </div>

            <label className="block text-xs font-medium text-stone-500 mb-1">Nombre del negocio</label>
            <input readOnly value={v.negocio} className="w-full text-sm px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 mb-3" />

            <label className="block text-xs font-medium text-stone-500 mb-1">Rubro</label>
            <input readOnly value={v.rubro} className="w-full text-sm px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 mb-3" />
            <p className="text-[11px] text-stone-400">El rubro adapta el vocabulario del sistema: {v.unidad}s, {v.persona}s, y el tono de los mensajes.</p>
          </section>

          {/* Canales de comunicación */}
          <section className="rounded-2xl bg-white border border-stone-200 p-4">
            <h2 className="font-semibold mb-1">Canales de envío</h2>
            <p className="text-xs text-stone-400 mb-4">Desde dónde salen los recordatorios y recibos.</p>

            <label className="block text-xs font-medium text-stone-500 mb-1">WhatsApp del negocio</label>
            <div className="flex items-center gap-2 mb-1">
              <input readOnly value={v.config.whatsapp} className="flex-1 text-sm px-3 py-2 rounded-xl border border-stone-200 bg-stone-50" />
              <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ color: "#047857", background: "#D1FAE5" }}>Verificado</span>
            </div>
            <p className="text-[11px] text-stone-400 mb-4">Número conectado a la API oficial de WhatsApp Business. Tus clientes ven el nombre y logo de tu negocio, no un número desconocido.</p>

            <label className="block text-xs font-medium text-stone-500 mb-1">Email de respaldo</label>
            <input readOnly value={v.config.email} className="w-full text-sm px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 mb-1" />
            <p className="text-[11px] text-stone-400">Si un cliente no tiene WhatsApp, el recibo sale por acá. También recibís vos el resumen semanal.</p>
          </section>

          {/* Mercado Pago */}
          <section className="rounded-2xl bg-white border border-stone-200 p-4 lg:col-span-2">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold mb-1">Cobros con Mercado Pago</h2>
                <p className="text-xs text-stone-400 max-w-md">
                  La plata va directo a tu cuenta de Mercado Pago de siempre. AlDía nunca toca tus fondos: solo genera los links de pago y detecta cuándo se acreditan.
                </p>
              </div>
              {v.config.mpConectado ? (
                <div className="text-right">
                  <span className="inline-block text-xs px-3 py-1.5 rounded-full font-medium" style={{ color: "#047857", background: "#D1FAE5" }}>
                    Conectado · {v.config.mpCuenta}
                  </span>
                  <p className="text-[11px] text-stone-400 mt-1">
                    <button className="underline">Desconectar</button>
                  </p>
                </div>
              ) : (
                <button className="text-sm px-4 py-2 rounded-xl text-white font-medium" style={{ background: "#047857" }}>
                  Conectar con Mercado Pago
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-xs text-stone-500">
              <div className="rounded-xl bg-stone-50 p-3">
                <p className="font-semibold text-stone-700 mb-1">1 · Autorizás una vez</p>
                Tocás el botón, entrás a tu cuenta de Mercado Pago y autorizás. Sin copiar tokens ni claves a mano.
              </div>
              <div className="rounded-xl bg-stone-50 p-3">
                <p className="font-semibold text-stone-700 mb-1">2 · Cada deuda, su link</p>
                AlDía genera un link de pago por cada {v.unidad} vencida, con el monto y el nombre del {v.persona} ya cargados.
              </div>
              <div className="rounded-xl bg-stone-50 p-3">
                <p className="font-semibold text-stone-700 mb-1">3 · Se concilia solo</p>
                Cuando el pago se acredita, la secuencia se frena, el cobro se registra y el recibo sale automáticamente.
              </div>
            </div>
          </section>
        </div>
        )}

        {vista === "cobros" && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Historial de cobros */}
          <section className="lg:col-span-3 rounded-2xl bg-white border border-stone-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-stone-100 flex items-center justify-between">
              <h2 className="font-semibold">Cobros registrados</h2>
              <span className="text-sm font-semibold" style={{ color: "#047857" }}>{fmt(totalCobrado)} este mes</span>
            </div>
            <ul>
              {cobros.map((c) => {
                const activo = c.id === recibo.id;
                return (
                  <li key={c.id}>
                    <button
                      onClick={() => setSelCobro((p) => ({ ...p, [vertical]: c.id }))}
                      className={"fila w-full text-left px-4 py-3 border-b border-stone-100 flex items-center gap-3 " + (activo ? "bg-stone-50" : "")}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{c.nombre}</p>
                        <p className="text-xs text-stone-400 truncate">{c.concepto} · {c.fecha}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-semibold">{fmt(c.monto)}</p>
                        <p className="text-xs text-stone-400">{c.medio} · {c.via}</p>
                      </div>
                      <span className="text-xs font-mono text-stone-400 shrink-0">{c.id}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <p className="px-4 py-3 text-xs text-stone-400">
              Cada cobro genera su recibo y se envía solo por WhatsApp al momento de acreditarse. Sin intervención del negocio.
            </p>
          </section>

          {/* Recibo como llega al cliente */}
          <section className="lg:col-span-2 rounded-2xl bg-white border border-stone-200 overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-stone-100">
              <h2 className="font-semibold text-sm">Así le llega el recibo a {recibo.nombre.split(" ")[0]}</h2>
            </div>
            <div className="flex-1 p-3" style={{ background: "#ECE5DD" }}>
              <div className="max-w-[90%] ml-auto rounded-xl px-3 py-2 text-sm whitespace-pre-line shadow-sm" style={{ background: "#DCF8C6" }}>
                {`Recibimos tu pago. Gracias.\n\n*Recibo ${recibo.id}*\n${v.negocio}\n${recibo.concepto}\nMonto: ${fmt(recibo.monto)}\nMedio: ${recibo.medio}\nFecha: ${recibo.fecha}\n\nGuardá este mensaje como comprobante.`}
                <p className="text-right text-[10px] text-stone-400 mt-1">{recibo.fecha}</p>
              </div>
              <p className="text-center text-[10px] text-stone-500 mt-3">Enviado con AlDía</p>
            </div>
            <div className="p-3 border-t border-stone-100">
              <button className="w-full text-sm px-3 py-2 rounded-xl border border-stone-200 bg-white font-medium hover:bg-stone-50">
                Reenviar por email
              </button>
              <p className="text-[11px] text-stone-400 mt-2 text-center">
                Comprobante de pago interno. No reemplaza la factura fiscal.
              </p>
            </div>
          </section>
        </div>
        )}

        {/* ── Resumen semanal: el mensaje que renueva la suscripción ── */}
        <section className="mt-6 rounded-2xl border border-stone-200 bg-white p-4">
          <p className="text-xs uppercase tracking-widest text-stone-400 mb-2">Cada lunes, el dueño recibe esto por WhatsApp</p>
          <div className="max-w-md rounded-xl px-4 py-3 text-sm whitespace-pre-line shadow-sm" style={{ background: "#DCF8C6" }}>
            {`*Resumen semanal · ${v.negocio}*\n\nRecuperado: *${fmt(recuperado)}*\nEn gestión: ${fmt(enGestion)}\nTasa de recuperación: ${tasa}%\n\nAlDía trabajó por vos esta semana. No hiciste ni una llamada.`}
          </div>
        </section>

        <p className="text-center text-xs text-stone-400 mt-6">
          Prototipo de demostración · datos ficticios · los pagos se concilian vía webhook de Mercado Pago y el recibo se envía solo
        </p>
      </main>
    </div>
  );
}
