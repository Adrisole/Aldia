import { FormEvent, useEffect, useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import type { Tenant } from "../lib/types";

export function ConfigView({ tenant }: { tenant: Tenant }) {
  const { recargarTenant } = useAuth();
  const [emailRespaldo, setEmailRespaldo] = useState(tenant.emailRespaldo ?? "");
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [conectandoMP, setConectandoMP] = useState(false);

  const params = new URLSearchParams(window.location.search);
  const mpResultado = params.get("mp");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setGuardado(false);
    try {
      await api<{ tenant: Tenant }>("/config", {
        method: "PUT",
        body: JSON.stringify({ emailRespaldo }),
      });
      await recargarTenant();
      setGuardado(true);
    } finally {
      setGuardando(false);
    }
  };

  const conectarMercadoPago = async () => {
    setConectandoMP(true);
    try {
      const data = await api<{ url: string }>("/mp/oauth/iniciar");
      window.location.href = data.url;
    } catch {
      setConectandoMP(false);
    }
  };

  useEffect(() => {
    if (!mpResultado) return;
    recargarTenant();
    const url = new URL(window.location.href);
    url.searchParams.delete("mp");
    window.history.replaceState({}, "", url.toString());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <section className="rounded-2xl bg-white border border-stone-200 p-4">
        <h2 className="font-semibold mb-1">Identidad del negocio</h2>
        <p className="text-xs text-stone-400 mb-4">Esto aparece en cada mensaje y en cada recibo que reciben tus clientes.</p>

        <label className="block text-xs font-medium text-stone-500 mb-1">Nombre del negocio</label>
        <input readOnly value={tenant.nombre} className="w-full text-sm px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 mb-3" />

        <label className="block text-xs font-medium text-stone-500 mb-1">Rubro</label>
        <input readOnly value={tenant.rubro} className="w-full text-sm px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 mb-3" />
        <p className="text-[11px] text-stone-400">
          El rubro adapta el vocabulario del sistema: {tenant.vocabulario.unidad}s, {tenant.vocabulario.persona}s.
        </p>
      </section>

      <section className="rounded-2xl bg-white border border-stone-200 p-4">
        <h2 className="font-semibold mb-1">Canales de envío</h2>
        <p className="text-xs text-stone-400 mb-4">Desde dónde salen los recordatorios y recibos.</p>

        <form onSubmit={onSubmit}>
          <label className="block text-xs font-medium text-stone-500 mb-1">Email de respaldo</label>
          <input
            type="email"
            value={emailRespaldo}
            onChange={(e) => setEmailRespaldo(e.target.value)}
            className="w-full text-sm px-3 py-2 rounded-xl border border-stone-200 mb-3"
          />
          <button
            type="submit"
            disabled={guardando}
            className="text-sm px-4 py-2 rounded-xl text-white font-medium disabled:opacity-60"
            style={{ background: "#047857" }}
          >
            {guardando ? "Guardando..." : "Guardar"}
          </button>
          {guardado && <span className="ml-3 text-xs text-emerald-700">Guardado.</span>}
        </form>
      </section>

      <section className="rounded-2xl bg-white border border-stone-200 p-4 lg:col-span-2">
        <h2 className="font-semibold mb-1">Cobros con Mercado Pago</h2>
        <p className="text-xs text-stone-400 max-w-md mb-3">
          La plata va directo a tu cuenta de Mercado Pago. AlDía nunca la toca: solo genera los links de pago y detecta cuándo se acreditan.
        </p>

        {mpResultado === "conectado" && (
          <p className="text-xs text-emerald-700 mb-3">Cuenta de Mercado Pago conectada correctamente.</p>
        )}
        {mpResultado === "error" && (
          <p className="text-xs text-red-600 mb-3">No se pudo completar la conexión con Mercado Pago. Probá de nuevo.</p>
        )}

        <div className="flex items-center gap-3">
          <span
            className="inline-block text-xs px-3 py-1.5 rounded-full font-medium"
            style={tenant.mpConectado ? { color: "#047857", background: "#D1FAE5" } : { color: "#78716C", background: "#F5F5F4" }}
          >
            {tenant.mpConectado ? "Conectado" : "No conectado"}
          </span>
          {!tenant.mpConectado && (
            <button
              onClick={conectarMercadoPago}
              disabled={conectandoMP}
              className="text-sm px-4 py-2 rounded-xl text-white font-medium disabled:opacity-60"
              style={{ background: "#047857" }}
            >
              {conectandoMP ? "Redirigiendo..." : "Conectar con Mercado Pago"}
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
