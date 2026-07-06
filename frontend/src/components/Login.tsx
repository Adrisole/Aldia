import { FormEvent, useState } from "react";
import { useAuth } from "../context/AuthContext";

export function Login() {
  const { login, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [enviando, setEnviando] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    try {
      await login(email, password);
    } catch {
      // el error ya queda expuesto por el contexto
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "#F5F4F0", fontFamily: "'Archivo', system-ui, sans-serif" }}
    >
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-2xl bg-white border border-stone-200 p-6"
      >
        <p className="num-hero text-2xl mb-1" style={{ color: "#047857" }}>
          AlDía
        </p>
        <p className="text-xs text-stone-400 mb-6">Ingresá a tu panel de cobranzas</p>

        <label className="block text-xs font-medium text-stone-500 mb-1">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full text-sm px-3 py-2 rounded-xl border border-stone-200 mb-3"
          autoComplete="username"
        />

        <label className="block text-xs font-medium text-stone-500 mb-1">Contraseña</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full text-sm px-3 py-2 rounded-xl border border-stone-200 mb-4"
          autoComplete="current-password"
        />

        {error && <p className="text-xs text-red-600 mb-3">{error}</p>}

        <button
          type="submit"
          disabled={enviando}
          className="w-full text-sm px-3 py-2 rounded-xl text-white font-medium disabled:opacity-60"
          style={{ background: "#047857" }}
        >
          {enviando ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </div>
  );
}
