import { useState } from "react";
import { api, setToken } from "../lib/api";
import { ACCENT, FONT, FONT_NUM, LIGHT } from "../lib/theme";

export default function Auth({ onAuth }) {
  const theme = LIGHT;
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");
    if (!email || !password || (mode === "register" && !name)) {
      setError("Rellena todos los campos");
      return;
    }
    setLoading(true);
    try {
      const data = mode === "login" ? await api.login({ email, password }) : await api.register({ email, password, name });
      setToken(data.token);
      onAuth(data);
    } catch (err) {
      setError(err.message === "Failed to fetch" ? "El servidor puede estar arrancando, espera unos segundos y reintenta" : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-6" style={{ background: theme.bg, fontFamily: FONT }}>
      <div className="w-full max-w-sm">
        <h1 className="text-center mb-1" style={{ fontFamily: FONT_NUM, fontSize: "2rem", fontWeight: 700, color: theme.text }}>
          Finanzas
        </h1>
        <p className="text-center text-sm mb-8" style={{ color: theme.sub }}>
          {mode === "login" ? "Entra en tu cuenta" : "Crea tu cuenta"}
        </p>

        <div className="space-y-3">
          {mode === "register" && (
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre" className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none" style={{ background: theme.surfaceAlt, color: theme.text }} />
          )}
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none" style={{ background: theme.surfaceAlt, color: theme.text }} />
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Contraseña" onKeyDown={(e) => e.key === "Enter" && submit()} className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none" style={{ background: theme.surfaceAlt, color: theme.text }} />
        </div>

        {error && <p className="text-xs text-center mt-3" style={{ color: "#FF3B30" }}>{error}</p>}

        <button onClick={submit} disabled={loading} className="w-full py-3.5 rounded-full text-sm font-semibold text-white mt-5 disabled:opacity-50" style={{ background: ACCENT }}>
          {loading ? "Cargando..." : mode === "login" ? "Entrar" : "Crear cuenta"}
        </button>

        <button onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }} className="w-full text-center text-sm mt-4" style={{ color: ACCENT }}>
          {mode === "login" ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Entra"}
        </button>

        <p className="text-xs text-center mt-6 px-4" style={{ color: theme.sub }}>
          La primera petición puede tardar unos segundos si el servidor estaba dormido.
        </p>
      </div>
    </div>
  );
}
