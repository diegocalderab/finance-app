import { useState, useEffect } from "react";
import { ArrowUpRight, ArrowDownRight, Home } from "lucide-react";
import { GREEN, RED, FONT, FONT_NUM, ICON_MAP } from "../lib/theme";

export function Card({ children, theme, className = "", style = {} }) {
  return (
    <div className={`rounded-3xl p-5 ${className}`} style={{ background: theme.surface, boxShadow: theme.shadow, ...style }}>
      {children}
    </div>
  );
}

export function Delta({ value, theme, invert = false }) {
  if (value === null || value === undefined || Number.isNaN(value)) return null;
  const positive = invert ? value <= 0 : value >= 0;
  const color = positive ? GREEN : RED;
  return (
    <span className="inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-1 rounded-full" style={{ background: positive ? "rgba(52,199,89,0.14)" : "rgba(255,59,48,0.14)", color }}>
      {value >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
      {Math.abs(value).toFixed(1)}%
    </span>
  );
}

export function CategoryIcon({ icon, color, size = 18, padded = true }) {
  const Icon = ICON_MAP[icon] || Home;
  if (!padded) return <Icon size={size} style={{ color }} />;
  return (
    <div className="rounded-full flex items-center justify-center flex-shrink-0" style={{ width: size + 22, height: size + 22, background: color + "1F" }}>
      <Icon size={size} style={{ color }} />
    </div>
  );
}

export function Switch({ on, onClick }) {
  return (
    <button onClick={onClick} className="relative rounded-full transition-colors" style={{ width: 51, height: 31, background: on ? GREEN : "#86868B40" }}>
      <span className="absolute rounded-full bg-white transition-transform" style={{ width: 27, height: 27, top: 2, left: 2, boxShadow: "0 2px 4px rgba(0,0,0,0.2)", transform: on ? "translateX(20px)" : "translateX(0)" }} />
    </button>
  );
}

export function CircularProgress({ pct, size = 56, stroke = 6, color, theme, children }) {
  const [animated, setAnimated] = useState(0);
  useEffect(() => { const t = setTimeout(() => setAnimated(pct), 60); return () => clearTimeout(t); }, [pct]);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(animated, 100) / 100) * c;
  return (
    <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={theme.surfaceAlt} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: "stroke-dashoffset 900ms cubic-bezier(.4,0,.2,1)" }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}

export function AnimatedNumber({ value, decimals = 0, duration = 900, suffix = "" }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let startVal = n;
    let startTime = null;
    let raf;
    const step = (ts) => {
      if (!startTime) startTime = ts;
      const p = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(startVal + ((value || 0) - startVal) * eased);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return <>{n.toLocaleString("es-ES", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}</>;
}

export function GlassTooltip({ active, payload, label, theme }) {
  if (!active || !payload || !payload.length) return null;
  // Cada serie se dibuja dos veces (la línea visible + un halo detrás para
  // el efecto de brillo). Sin esto, el tooltip mostraba cada dato 2 veces.
  const seen = new Set();
  const unique = payload.filter((p) => {
    const key = p.dataKey || p.name;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return (
    <div className="rounded-2xl px-3 py-2 text-xs" style={{ background: theme.glass, backdropFilter: "blur(16px)", border: `1px solid ${theme.border}`, boxShadow: theme.shadow, animation: "tooltipIn 160ms ease-out", fontFamily: FONT }}>
      {label && <p className="font-semibold mb-1" style={{ color: theme.text }}>{label}</p>}
      {unique.map((p, i) => (
        <p key={i} className="flex items-center gap-1.5" style={{ color: theme.sub }}>
          <span className="rounded-full" style={{ width: 6, height: 6, background: p.color || p.payload?.fill }} />
          {p.name}: <span style={{ color: theme.text, fontWeight: 600, fontFamily: FONT_NUM }}>{p.value?.toLocaleString("es-ES", { maximumFractionDigits: 0 })} €</span>
        </p>
      ))}
    </div>
  );
}

export function Spinner({ theme }) {
  return (
    <div className="flex items-center justify-center py-12">
      <div
        className="rounded-full animate-spin"
        style={{ width: 28, height: 28, border: `3px solid ${theme.surfaceAlt}`, borderTopColor: theme.sub }}
      />
    </div>
  );
}

export function ErrorNote({ message, theme }) {
  if (!message) return null;
  return (
    <p className="text-xs text-center px-4 py-3 rounded-2xl" style={{ background: "rgba(255,59,48,0.1)", color: RED }}>
      {message}
    </p>
  );
}
