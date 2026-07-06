import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { Deuda, Mensaje, Tenant } from "../lib/types";

const ESTADOS: Record<string, { label: string; paso: number; color: string; bg: string }> = {
  pendiente: { label: "Pendiente", paso: 0, color: "#57534E", bg: "#F5F5F4" },
  en_secuencia: { label: "En secuencia", paso: 1, color: "#57534E", bg: "#F5F5F4" },
  respondio_manual: { label: "Respondió · manual", paso: 0, color: "#57534E", bg: "#F5F5F4" },
  pausada: { label: "Pausada", paso: 0, color: "#78716C", bg: "#F5F5F4" },
  cobrada: { label: "Recuperada", paso: 4, color: "#047857", bg: "#D1FAE5" },
  incobrable: { label: "Incobrable", paso: 0, color: "#B91C1C", bg: "#FEE2E2" },
};

const fmt = (n: number | string) =>
  "$" + Number(n).toLocaleString("es-AR", { maximumFractionDigits: 0 });

export function DeudasView({ tenant }: { tenant: Tenant }) {
  const [deudas, setDeudas] = useState<Deuda[]>([]);
  const [selId, setSelId] = useState<string | null>(null);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [cargando, setCargando] = useState(true);
  const [accionEnCurso, setAccionEnCurso] = useState(false);

  const cargarDeudas = async () => {
    const data = await api<{ deudas: Deuda[] }>("/deudas");
    setDeudas(data.deudas);
    setCargando(false);
    if (!selId && data.deudas.length > 0) setSelId(data.deudas[0].id);
  };

  useEffect(() => {
    cargarDeudas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selId) return;
    api<{ mensajes: Mensaje[] }>(`/deudas/${selId}/mensajes`).then((d) => setMensajes(d.mensajes));
  }, [selId]);

  const sel = deudas.find((d) => d.id === selId);

  const togglePausa = async () => {
    if (!sel) return;
    setAccionEnCurso(true);
    try {
      const ruta = sel.estado === "pausada" ? "reanudar" : "pausar";
      await api(`/deudas/${sel.id}/${ruta}`, { method: "POST" });
      await cargarDeudas();
      const data = await api<{ mensajes: Mensaje[] }>(`/deudas/${sel.id}/mensajes`);
      setMensajes(data.mensajes);
    } finally {
      setAccionEnCurso(false);
    }
  };

  const registrarPago = async () => {
    if (!sel) return;
    setAccionEnCurso(true);
    try {
      await api(`/deudas/${sel.id}/pago-manual`, {
        method: "POST",
        body: JSON.stringify({ medio: "transferencia" }),
      });
      await cargarDeudas();
      const data = await api<{ mensajes: Mensaje[] }>(`/deudas/${sel.id}/mensajes`);
      setMensajes(data.mensajes);
    } finally {
      setAccionEnCurso(false);
    }
  };

  if (cargando) return <p className="text-sm text-stone-400">Cargando deudas...</p>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
      <section className="lg:col-span-3 rounded-2xl bg-white border border-stone-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-stone-100 flex items-center justify-between">
          <h2 className="font-semibold">{tenant.vocabulario.unidad}s</h2>
          <span className="text-xs text-stone-400">tocá una fila para ver la conversación</span>
        </div>
        <ul>
          {deudas.map((d) => {
            const e = ESTADOS[d.estado] ?? ESTADOS.pendiente;
            const activa = d.id === selId;
            return (
              <li key={d.id}>
                <button
                  onClick={() => setSelId(d.id)}
                  className={"fila w-full text-left px-4 py-3 border-b border-stone-100 flex items-center gap-3 " + (activa ? "bg-stone-50" : "")}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{d.cliente.nombre}</p>
                    <p className="text-xs text-stone-400 truncate">
                      {d.concepto} · vence {new Date(d.vencimiento).toLocaleDateString("es-AR")}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-semibold">{fmt(d.monto)}</p>
                    <span
                      className="inline-block text-xs px-2 py-0.5 rounded-full mt-0.5"
                      style={{ color: e.color, background: e.bg }}
                    >
                      {e.label}
                    </span>
                  </div>
                </button>
              </li>
            );
          })}
          {deudas.length === 0 && <li className="px-4 py-6 text-sm text-stone-400">Sin deudas cargadas.</li>}
        </ul>
      </section>

      <section className="lg:col-span-2 rounded-2xl bg-white border border-stone-200 overflow-hidden flex flex-col">
        {sel ? (
          <>
            <div className="px-4 py-3 flex items-center gap-3" style={{ background: "#075E54", color: "white" }}>
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
                {sel.cliente.nombre.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">{sel.cliente.nombre}</p>
                <p className="text-xs opacity-75 truncate">{sel.concepto}</p>
              </div>
            </div>
            <div
              className="flex-1 p-3 space-y-2 overflow-y-auto"
              style={{ background: "#ECE5DD", minHeight: "260px", maxHeight: "340px" }}
            >
              {mensajes.map((m) =>
                m.direccion === "sistema" ? (
                  <p key={m.id} className="text-center text-xs text-stone-500 bg-white/70 rounded-full px-3 py-1 mx-auto w-fit">
                    {m.contenido}
                  </p>
                ) : (
                  <div
                    key={m.id}
                    className={"max-w-[85%] rounded-xl px-3 py-2 text-sm whitespace-pre-line shadow-sm " + (m.direccion === "saliente" ? "ml-auto" : "mr-auto bg-white")}
                    style={m.direccion === "saliente" ? { background: "#DCF8C6" } : {}}
                  >
                    {m.contenido}
                    <p className="text-right text-[10px] text-stone-400 mt-1">
                      {new Date(m.creadoEn).toLocaleString("es-AR")}
                    </p>
                  </div>
                ),
              )}
              {mensajes.length === 0 && <p className="text-xs text-stone-500 text-center">Sin mensajes todavía.</p>}
            </div>
            {sel.estado !== "cobrada" && (
              <div className="p-3 border-t border-stone-100 flex gap-2">
                <button
                  onClick={togglePausa}
                  disabled={accionEnCurso}
                  className="flex-1 text-sm px-3 py-2 rounded-xl border border-stone-200 bg-white font-medium hover:bg-stone-50 disabled:opacity-60"
                >
                  {sel.estado === "pausada" ? "Reanudar secuencia" : "Pausar secuencia"}
                </button>
                <button
                  onClick={registrarPago}
                  disabled={accionEnCurso}
                  className="flex-1 text-sm px-3 py-2 rounded-xl text-white font-medium disabled:opacity-60"
                  style={{ background: "#047857" }}
                >
                  Registrar pago
                </button>
              </div>
            )}
          </>
        ) : (
          <p className="p-4 text-sm text-stone-400">Seleccioná una deuda.</p>
        )}
      </section>
    </div>
  );
}
