import { useAuth } from "./context/AuthContext";
import { Login } from "./components/Login";
import { Panel } from "./components/Panel";

export function App() {
  const { tenant, cargando } = useAuth();

  if (cargando) {
    return <p className="p-6 text-sm text-stone-400">Cargando...</p>;
  }

  return tenant ? <Panel /> : <Login />;
}
