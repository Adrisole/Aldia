import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { api, clearToken, getToken, setToken } from "../lib/api";
import type { Tenant } from "../lib/types";

interface AuthContextValue {
  tenant: Tenant | null;
  cargando: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  recargarTenant: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const recargarTenant = useCallback(async () => {
    if (!getToken()) {
      setTenant(null);
      setCargando(false);
      return;
    }
    try {
      const data = await api<{ tenant: Tenant }>("/me");
      setTenant(data.tenant);
    } catch {
      clearToken();
      setTenant(null);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    recargarTenant();
  }, [recargarTenant]);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      const data = await api<{ token: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setToken(data.token);
      await recargarTenant();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo iniciar sesión");
      throw e;
    }
  }, [recargarTenant]);

  const logout = useCallback(() => {
    clearToken();
    setTenant(null);
  }, []);

  return (
    <AuthContext.Provider value={{ tenant, cargando, error, login, logout, recargarTenant }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
