import {
  Home, ShoppingCart, Car, Gamepad2, HeartPulse, Repeat, Briefcase, Gift,
  Coffee, Plane, Bell, PiggyBank, ShieldCheck,
} from "lucide-react";

export const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, sans-serif";
export const FONT_NUM = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif";

export const ACCENT = "#0071E3";
export const GREEN = "#34C759";
export const RED = "#FF3B30";

export const LIGHT = { bg: "#F5F5F7", surface: "#FFFFFF", surfaceAlt: "#F5F5F7", text: "#1D1D1F", sub: "#86868B", border: "rgba(0,0,0,0.06)", shadow: "0 10px 28px rgba(0,0,0,0.06)", glass: "rgba(255,255,255,0.78)" };
export const DARK = { bg: "#000000", surface: "#1C1C1E", surfaceAlt: "#2C2C2E", text: "#FFFFFF", sub: "#98989D", border: "rgba(255,255,255,0.08)", shadow: "0 10px 28px rgba(0,0,0,0.55)", glass: "rgba(28,28,30,0.78)" };

export const ICON_MAP = { Home, ShoppingCart, Car, Gamepad2, HeartPulse, Repeat, Briefcase, Gift, Coffee, Plane, Bell, PiggyBank, ShieldCheck };
export const ICON_CHOICES = ["Home", "ShoppingCart", "Car", "Gamepad2", "HeartPulse", "Repeat", "Briefcase", "Gift", "Coffee", "Plane"];
export const COLOR_CHOICES = ["#0071E3", "#34C759", "#FF9500", "#AF52DE", "#FF2D55", "#5AC8FA", "#FF3B30", "#86868B"];

export const fmt = (n) => new Intl.NumberFormat("es-ES", { maximumFractionDigits: 0 }).format(n || 0);
export const fmt2 = (n) => new Intl.NumberFormat("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0);
export const pctDelta = (a, b) => (b ? ((a - b) / b) * 100 : null);
export const weekday = (iso) => new Date(iso).toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });

// Últimos n meses reales (hoy incluido), no depende de un año fijo a mano.
export function lastMonths(n = 6) {
  const now = new Date();
  const arr = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    arr.push({
      month: d.getMonth() + 1,
      year: d.getFullYear(),
      label: d.toLocaleDateString("es-ES", { month: "long" }),
      short: d.toLocaleDateString("es-ES", { month: "short" }),
    });
  }
  return arr;
}
