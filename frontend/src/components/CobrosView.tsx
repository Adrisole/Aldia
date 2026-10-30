import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { Cobro } from "../lib/types";

const fmt = (n: number | string) =>
  "$" + Number(n).toLocaleString("es-AR", { maximumFractionDigits: 0 });

export function CobrosView() {
  const [cobros, setCobros] = useState<Cobro[]>([]);
  const [selId, setSelId] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    api<{ cobros: Cobro[] }>("/cobros").then((d) => {
      setCobros(d.cobros);
      setCargando(false);
      if (d.cobros.length > 0) setSelId(d.cobros[0].id);
    });
  }, []);

  if (cargando) return <p className="text-sm text-stone-400">Cargando cobros...</p>;

  const recibo = cobros.find((c) => c.id === selId);
  const total = cobros.reduce((acc, c) => acc + Number(c.monto), 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
      <section className="lg:col-span-3 rounded-2xl bg-white border border-stone-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-stone-100 flex items-center justify-between">
          <h2 className="font-semibold">Cobros registrados</h2>
          <span className="text-sm font-semibold" style={{ color: "#047857" }}>
            {fmt(total)}
          </span>
        </div>
        <ul>
          {cobros.map((c) => {
            const activo = c.id === selId;
            return (
              <li key={c.id}>
                <button
                  onClick={() => setSelId(c.id)}
                  className={"fila w-full text-left px-4 py-3 border-b border-stone-100 flex items-center gap-3 " + (activo ? "bg-stone-50" : "")}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{c.deuda.cliente.nombre}</p>
                    <p className="text-xs text-stone-400 truncate">
                      {c.deuda.concepto} · {new Date(c.cobradoEn).toLocaleString("es-AR")}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-semibold">{fmt(c.monto)}</p>
                    <p className="text-xs text-stone-400">{c.medio} · {c.via}</p>
                  </div>
                  <span className="text-xs font-mono text-stone-400 shrink-0">{c.numeroRecibo}</span>
                </button>
              </li>
            );
          })}
          {cobros.length === 0 && <li className="px-4 py-6 text-sm text-stone-400">Sin cobros todavía.</li>}
        </ul>
      </section>

      <section className="lg:col-span-2 rounded-2xl bg-white border border-stone-200 overflow-hidden flex flex-col">
        <div className="px-4 py-3 border-b border-stone-100">
          <h2 className="font-semibold text-sm">
            {recibo ? `Así le llega el recibo a ${recibo.deuda.cliente.nombre.split(" ")[0]}` : "Recibo"}
          </h2>
        </div>
        {recibo ? (
          <div className="flex-1 p-3" style={{ background: "#ECE5DD" }}>
            <div className="max-w-[90%] ml-auto rounded-xl px-3 py-2 text-sm whitespace-pre-line shadow-sm" style={{ background: "#DCF8C6" }}>
              {`Recibimos tu pago. Gracias.\n\nRecibo ${recibo.numeroRecibo}\n${recibo.deuda.concepto}\nMonto: ${fmt(recibo.monto)}\nMedio: ${recibo.medio}\nFecha: ${new Date(recibo.cobradoEn).toLocaleString("es-AR")}\n\nGuardá este mensaje como comprobante.`}
            </div>
            <p className="text-center text-[10px] text-stone-500 mt-3">Enviado con AlDía</p>
          </div>
        ) : (
          <p className="p-4 text-sm text-stone-400">Sin recibo para mostrar.</p>
        )}
      </section>
    </div>
  );
}
