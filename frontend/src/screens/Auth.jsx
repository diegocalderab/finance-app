import { useState, useEffect, useRef } from "react";
import { Eye, EyeOff, Sun, Moon } from "lucide-react";
import { api, setToken } from "../lib/api";
import { FONT, FONT_NUM } from "../lib/theme";

// Campo con label flotante
function FloatField({ label, type = "text", value, onChange, onFocus, onBlur, onKeyDown, focused, invalid, dark, suffix }) {
  const active = focused || value;
  const borderColor = invalid ? "#FF3B30" : focused ? "#0071E3" : dark ? "rgba(255,255,255,0.12)" : "rgba(0,113,227,0.18)";
  return (
    <div style={{ position: "relative" }}>
      <label style={{
        position: "absolute", left: 16,
        top: active ? 8 : "50%",
        transform: active ? "none" : "translateY(-50%)",
        fontSize: active ? "0.63rem" : "0.875rem",
        fontWeight: active ? 600 : 400,
        color: invalid ? "#FF3B30" : focused ? "#0071E3" : dark ? "#98989d" : "#86868b",
        transition: "all 0.17s ease", pointerEvents: "none", zIndex: 1, fontFamily: FONT,
      }}>
        {label}
      </label>
      <input
        type={type} value={value} onChange={onChange}
        onFocus={onFocus} onBlur={onBlur} onKeyDown={onKeyDown}
        style={{
          width: "100%", boxSizing: "border-box",
          paddingTop: active ? 22 : 14, paddingBottom: active ? 8 : 14,
          paddingLeft: 16, paddingRight: suffix ? 48 : 16,
          borderRadius: 13, border: `1.5px solid ${borderColor}`,
          background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,113,227,0.04)",
          color: dark ? "#ffffff" : "#1d1d1f",
          fontSize: "0.9rem", outline: "none", fontFamily: FONT,
          transition: "border-color 0.17s, box-shadow 0.17s",
          boxShadow: focused ? `0 0 0 3px #0071E322` : "none",
        }}
      />
      {suffix && (
        <div style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)" }}>
          {suffix}
        </div>
      )}
    </div>
  );
}

export default function Auth({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [dark, setDark] = useState(() => window.matchMedia("(prefers-color-scheme: dark)").matches);
  const [focusedField, setFocusedField] = useState(null);
  const [emailValid, setEmailValid] = useState(true);
  const canvasRef = useRef(null);

  const validateEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setEmailValid(e.target.value ? validateEmail(e.target.value) : true);
  };

  const submit = async (e) => {
    e?.preventDefault();
    setError("");
    if (!email || !password || (mode === "register" && !name)) {
      setError("Rellena todos los campos");
      return;
    }
    if (!validateEmail(email)) { setEmailValid(false); return; }
    setLoading(true);
    try {
      const data = mode === "login"
        ? await api.login({ email, password })
        : await api.register({ email, password, name });
      setToken(data.token);
      onAuth(data);
    } catch (err) {
      setError(err.message === "Failed to fetch"
        ? "El servidor puede estar arrancando, espera unos segundos y reintenta"
        : err.message);
    } finally {
      setLoading(false);
    }
  };

  // Partículas en canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    const count = Math.min(90, Math.floor((canvas.width * canvas.height) / 14000));
    const pts = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2.2 + 0.4,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      a: Math.random() * 0.22 + 0.04,
    }));

    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of pts) {
        p.x = (p.x + p.vx + canvas.width) % canvas.width;
        p.y = (p.y + p.vy + canvas.height) % canvas.height;
        ctx.fillStyle = dark ? `rgba(255,255,255,${p.a})` : `rgba(0,90,220,${p.a * 0.6})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { window.removeEventListener("resize", resize); cancelAnimationFrame(raf); };
  }, [dark]);

  const bg = dark
    ? "linear-gradient(135deg,#080c14 0%,#0d1a2e 55%,#080c14 100%)"
    : "linear-gradient(135deg,#e6efff 0%,#f5f8ff 55%,#deeeff 100%)";
  const cardBg = dark ? "rgba(16,20,34,0.88)" : "rgba(255,255,255,0.88)";
  const cardShadow = dark ? "0 36px 90px rgba(0,0,0,0.65)" : "0 36px 90px rgba(0,113,227,0.13)";
  const cardBorder = dark ? "rgba(255,255,255,0.07)" : "rgba(0,113,227,0.1)";
  const textPrimary = dark ? "#ffffff" : "#1d1d1f";
  const textSub = dark ? "#98989d" : "#86868b";
  const toggleBg = dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)";

  return (
    <div style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: bg, fontFamily: FONT, overflow: "hidden" }}>
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />

      {/* Toggle tema */}
      <button onClick={() => setDark(!dark)} style={{ position: "absolute", top: 18, right: 18, width: 40, height: 40, borderRadius: "50%", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", background: toggleBg, color: textPrimary, zIndex: 10, transition: "background 0.2s" }}>
        {dark ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      {/* Card */}
      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 400, margin: "0 20px", borderRadius: 28, background: cardBg, backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)", border: `1px solid ${cardBorder}`, boxShadow: cardShadow, padding: "40px 32px 36px", animation: "authCardIn 0.45s cubic-bezier(.34,1.4,.64,1)" }}>

        {/* Logo + título */}
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <div style={{ width: 54, height: 54, borderRadius: 17, background: "linear-gradient(135deg,#0071E3 0%,#34C759 100%)", margin: "0 auto 14px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 28px rgba(0,113,227,0.35)" }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <h1 style={{ fontFamily: FONT_NUM, fontSize: "1.7rem", fontWeight: 700, color: textPrimary, margin: 0, letterSpacing: "-0.02em" }}>
            {mode === "login" ? "Bienvenido" : "Crear cuenta"}
          </h1>
          <p style={{ color: textSub, fontSize: "0.84rem", marginTop: 6 }}>
            {mode === "login" ? "Entra en tu cuenta de finanzas" : "Empieza a gestionar tus finanzas"}
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {mode === "register" && (
            <FloatField label="Nombre" value={name} onChange={(e) => setName(e.target.value)} onFocus={() => setFocusedField("name")} onBlur={() => setFocusedField(null)} focused={focusedField === "name"} dark={dark} />
          )}

          <div>
            <FloatField label="Correo electrónico" type="email" value={email} onChange={handleEmailChange} onFocus={() => setFocusedField("email")} onBlur={() => setFocusedField(null)} focused={focusedField === "email"} invalid={!emailValid && email} dark={dark} />
            {!emailValid && email && <p style={{ fontSize: "0.7rem", color: "#FF3B30", marginTop: 4, marginLeft: 4 }}>Introduce un email válido</p>}
          </div>

          <FloatField label="Contraseña" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} onFocus={() => setFocusedField("password")} onBlur={() => setFocusedField(null)} onKeyDown={(e) => e.key === "Enter" && submit()} focused={focusedField === "password"} dark={dark}
            suffix={
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ background: "none", border: "none", cursor: "pointer", color: textSub, padding: 0, display: "flex" }}>
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            }
          />

          {error && (
            <p style={{ fontSize: "0.76rem", color: "#FF3B30", textAlign: "center", background: "rgba(255,59,48,0.1)", borderRadius: 10, padding: "9px 14px", margin: 0 }}>
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} style={{ marginTop: 4, padding: "14px", borderRadius: 14, border: "none", cursor: loading ? "not-allowed" : "pointer", background: loading ? "#86868b" : "linear-gradient(135deg,#0071E3 0%,#005bc4 100%)", color: "#ffffff", fontSize: "0.9rem", fontWeight: 600, fontFamily: FONT, boxShadow: loading ? "none" : "0 8px 24px rgba(0,113,227,0.38)", transition: "all 0.2s", transform: loading ? "none" : undefined }}>
            {loading ? "Cargando…" : mode === "login" ? "Entrar" : "Crear cuenta"}
          </button>
        </form>

        {/* Toggle modo */}
        <p style={{ textAlign: "center", fontSize: "0.8rem", marginTop: 22, color: textSub }}>
          {mode === "login" ? "¿No tienes cuenta? " : "¿Ya tienes cuenta? "}
          <button onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }} style={{ background: "none", border: "none", color: "#0071E3", fontWeight: 600, cursor: "pointer", fontSize: "0.8rem", fontFamily: FONT }}>
            {mode === "login" ? "Regístrate" : "Inicia sesión"}
          </button>
        </p>

        {mode === "login" && (
          <p style={{ textAlign: "center", fontSize: "0.68rem", marginTop: 14, color: textSub, opacity: 0.65 }}>
            La primera petición puede tardar unos segundos si el servidor estaba dormido.
          </p>
        )}
      </div>
    </div>
  );
}
