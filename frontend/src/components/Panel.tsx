import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import type { Metricas } from "../lib/types";
import { DeudasView } from "./DeudasView";
import { CobrosView } from "./CobrosView";
import { ConfigView } from "./ConfigView";

const fmt = (n: number) => "$" + n.toLocaleString("es-AR", { maximumFractionDigits: 0 });

type Vista = "deudas" | "cobros" | "config";

export function Panel() {
  const { tenant, logout } = useAuth();
  const [vista, setVista] = useState<Vista>("deudas");
  const [metricas, setMetricas] = useState<Metricas | null>(null);

  useEffect(() => {
    api<Metricas>("/metricas").then(setMetricas);
  }, [vista]);

  if (!tenant) return null;

  return (
    <div className="min-h-screen" style={{ background: "#F5F4F0", fontFamily: "'Archivo', system-ui, sans-serif", color: "#1C1917" }}>
      <header className="border-b border-stone-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center gap-3 justify-between">
          <div className="flex items-baseline gap-2">
            <span className="num-hero text-xl" style={{ color: "#047857" }}>AlDía</span>
            <span className="text-xs text-stone-400 hidden sm:inline">cobranzas automáticas por WhatsApp</span>
          </div>
          <button onClick={logout} className="text-xs text-stone-500 underline">
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-5">
        <p className="text-xs uppercase tracking-widest text-stone-400 mb-1">{tenant.rubro}</p>
        <h1 className="text-2xl font-bold mb-4">{tenant.nombre}</h1>

        {metricas && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            <div className="rounded-2xl p-4 text-white sm:col-span-1" style={{ background: "#065F46" }}>
              <p className="text-xs uppercase tracking-wider opacity-80">Recuperado este mes</p>
              <p className="num-hero text-3xl mt-1">{fmt(metricas.recuperado)}</p>
              <p className="text-xs mt-1 opacity-80">sin que nadie levantara el teléfono</p>
            </div>
            <div className="rounded-2xl p-4 bg-white border border-stone-200">
              <p className="text-xs uppercase tracking-wider text-stone-400">En gestión</p>
              <p className="num-hero text-3xl mt-1">{fmt(metricas.enGestion)}</p>
              <p className="text-xs mt-1 text-stone-400">{tenant.vocabulario.unidad}s con secuencia activa</p>
            </div>
            <div className="rounded-2xl p-4 bg-white border border-stone-200">
              <p className="text-xs uppercase tracking-wider text-stone-400">Tasa de recuperación</p>
              <p className="num-hero text-3xl mt-1" style={{ color: "#047857" }}>{metricas.tasa}%</p>
              <p className="text-xs mt-1 text-stone-400">de las deudas del mes ya cobradas</p>
            </div>
          </div>
        )}

        <div className="flex gap-1 mb-4 border-b border-stone-200">
          {(
            [
              ["deudas", "Deudas"],
              ["cobros", "Cobros y recibos"],
              ["config", "Configuración"],
            ] as [Vista, string][]
          ).map(([k, label]) => (
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

        {vista === "deudas" && <DeudasView tenant={tenant} />}
        {vista === "cobros" && <CobrosView />}
        {vista === "config" && <ConfigView tenant={tenant} />}
      </main>
    </div>
  );
}
