import { useState, useEffect } from "react";
import { Plus, ChevronLeft, TrendingUp, TrendingDown } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { api } from "../lib/api";
import { ACCENT, GREEN, RED, FONT, FONT_NUM, fmt2 } from "../lib/theme";
import { Card, Delta, AnimatedNumber, GlassTooltip, Spinner, ErrorNote } from "../components/ui";
import { AddInvestmentSheet } from "../components/sheets";

function assetColor(symbol = "") {
  if (symbol.endsWith("-USD")) return "#FF9500";
  if (symbol.startsWith("^")) return "#AF52DE";
  if (symbol.endsWith("=F")) return "#FFD60A";
  return ACCENT;
}

const RANGES = [
  { id: "1d", label: "1D" },
  { id: "5d", label: "5D" },
  { id: "1mo", label: "1M" },
  { id: "6mo", label: "6M" },
  { id: "1y", label: "1A" },
  { id: "5y", label: "5A" },
];

function InvestmentDetail({ holding, liveQuote, theme, onBack }) {
  const [range, setRange] = useState("1mo");
  const [history, setHistory] = useState([]);
  const [loadingChart, setLoadingChart] = useState(true);

  useEffect(() => {
    setLoadingChart(true);
    api.marketHistory(holding.ticker, range)
      .then((d) => setHistory(d.points || []))
      .catch(() => setHistory([]))
      .finally(() => setLoadingChart(false));
  }, [holding.ticker, range]);

  const price = liveQuote?.price ?? Number(holding.currentPrice);
  const currency = liveQuote?.currency ?? "";
  const color = assetColor(holding.ticker);
  const qty = Number(holding.quantity);
  const avgP = Number(holding.avgPrice);
  const totalCost = qty * avgP;
  const totalNow = qty * price;
  const gainAbs = totalNow - totalCost;
  const gainPct = totalCost ? (gainAbs / totalCost) * 100 : 0;
  const change1d = liveQuote?.change1d ?? 0;
  const change1mo = liveQuote?.change1mo ?? 0;

  return (
    <div className="space-y-5">
      <button onClick={onBack} className="flex items-center gap-1 text-sm font-medium" style={{ color: ACCENT }}>
        <ChevronLeft size={18} /> Cartera
      </button>

      {/* Header precio */}
      <Card theme={theme} style={{ borderTop: `4px solid ${color}` }}>
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-lg" style={{ background: color + "20", color }}>{holding.ticker}</span>
            <p className="text-sm font-semibold mt-1.5" style={{ color: theme.text }}>{holding.name}</p>
          </div>
          <Delta value={change1d} theme={theme} />
        </div>
        <div className="mt-3 flex items-end gap-2">
          <span style={{ fontFamily: FONT_NUM, fontSize: "2.25rem", fontWeight: 700, color: theme.text }}>
            {price.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="mb-2 text-sm font-medium" style={{ color: theme.sub }}>{currency}</span>
        </div>
        <div className="flex gap-4 mt-1">
          <span className="text-xs" style={{ color: theme.sub }}>1D <span style={{ color: change1d >= 0 ? GREEN : RED, fontWeight: 600 }}>{change1d >= 0 ? "+" : ""}{change1d.toFixed(2)}%</span></span>
          <span className="text-xs" style={{ color: theme.sub }}>1M <span style={{ color: change1mo >= 0 ? GREEN : RED, fontWeight: 600 }}>{change1mo >= 0 ? "+" : ""}{change1mo.toFixed(2)}%</span></span>
        </div>
      </Card>

      {/* Gráfica histórica */}
      <Card theme={theme}>
        <div className="flex gap-1.5 mb-4">
          {RANGES.map((r) => (
            <button key={r.id} onClick={() => setRange(r.id)} className="flex-1 py-1 rounded-full text-xs font-semibold" style={{ background: range === r.id ? color : theme.surfaceAlt, color: range === r.id ? "#FFFFFF" : theme.sub }}>
              {r.label}
            </button>
          ))}
        </div>
        {loadingChart ? <Spinner theme={theme} /> : history.length > 1 ? (
          <div style={{ height: 160 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id={`gInv_${holding.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke={theme.border} />
                <XAxis dataKey="date" tick={{ fontFamily: FONT, fontSize: 10, fill: theme.sub }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis hide domain={["auto", "auto"]} />
                <Tooltip content={(p) => <GlassTooltip {...p} theme={theme} />} />
                <Area type="monotone" dataKey="price" stroke={color} strokeWidth={10} strokeOpacity={0.15} fill="none" isAnimationActive={false} />
                <Area type="monotone" dataKey="price" name="Precio" stroke={color} fill={`url(#gInv_${holding.id})`} strokeWidth={2.5} activeDot={{ r: 5, fill: color, stroke: theme.surface, strokeWidth: 2 }} animationDuration={800} animationEasing="ease-out" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-sm text-center py-8" style={{ color: theme.sub }}>Sin datos para este período</p>
        )}
      </Card>

      {/* Mi posición */}
      <Card theme={theme}>
        <p className="text-sm font-semibold mb-3" style={{ color: theme.text }}>Mi posición</p>
        <div className="space-y-2.5">
          <div className="flex justify-between text-sm">
            <span style={{ color: theme.sub }}>Cantidad</span>
            <span style={{ fontWeight: 600, color: theme.text, fontFamily: FONT_NUM }}>{qty.toLocaleString("es-ES", { maximumFractionDigits: 6 })} uds.</span>
          </div>
          <div className="flex justify-between text-sm">
            <span style={{ color: theme.sub }}>Precio medio compra</span>
            <span style={{ fontWeight: 600, color: theme.text, fontFamily: FONT_NUM }}>{avgP.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span style={{ color: theme.sub }}>Capital invertido</span>
            <span style={{ fontWeight: 600, color: theme.text, fontFamily: FONT_NUM }}>{totalCost.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span style={{ color: theme.sub }}>Valor actual</span>
            <span style={{ fontWeight: 600, color: theme.text, fontFamily: FONT_NUM }}>{totalNow.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency}</span>
          </div>
          <div className="h-px" style={{ background: theme.border }} />
          <div className="flex justify-between text-sm">
            <span className="font-semibold" style={{ color: theme.text }}>Ganancia / Pérdida</span>
            <div className="flex items-center gap-2">
              <span style={{ fontWeight: 700, fontFamily: FONT_NUM, color: gainAbs >= 0 ? GREEN : RED }}>
                {gainAbs >= 0 ? "+" : ""}{gainAbs.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency}
              </span>
              <Delta value={gainPct} theme={theme} />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function Investments({ theme }) {
  const [investments, setInvestments] = useState([]);
  const [total, setTotal] = useState(0);
  const [liveQuotes, setLiveQuotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const load = () => {
    setLoading(true);
    api.investments()
      .then((d) => {
        const invs = d?.investments || [];
        setInvestments(invs);
        setTotal(d?.total || 0);
        // Refresca precios en tiempo real en paralelo
        if (invs.length) {
          Promise.all(
            invs.map((inv) =>
              api.marketQuote(inv.ticker)
                .then((q) => ({ id: inv.id, ticker: inv.ticker, ...q }))
                .catch(() => null)
            )
          ).then((quotes) => {
            const valid = quotes.filter(Boolean);
            setLiveQuotes(Object.fromEntries(valid.map((q) => [q.ticker, q])));
            valid.forEach((q) => api.updateInvestmentPrice(q.id, q.price).catch(() => {}));
          });
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleAdd = async (payload) => {
    setSaving(true);
    setSaveError("");
    try {
      await api.createInvestment(payload);
      setShowAdd(false);
      load();
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const selected = selectedId ? investments.find((i) => i.id === selectedId) : null;
  if (selected) {
    return (
      <div className="space-y-5">
        <InvestmentDetail holding={selected} liveQuote={liveQuotes[selected.ticker]} theme={theme} onBack={() => setSelectedId(null)} />
      </div>
    );
  }

  // Totales con precios en tiempo real
  const liveTotal = investments.reduce((sum, inv) => {
    const q = liveQuotes[inv.ticker];
    const price = q?.price ?? Number(inv.currentPrice);
    return sum + Number(inv.quantity) * price;
  }, 0);
  const costTotal = investments.reduce((sum, inv) => sum + Number(inv.quantity) * Number(inv.avgPrice), 0);
  const totalGainPct = costTotal ? ((liveTotal - costTotal) / costTotal) * 100 : 0;
  const totalGainAbs = liveTotal - costTotal;
  const hasLive = Object.keys(liveQuotes).length > 0;

  return (
    <div className="space-y-5">
      <ErrorNote message={error} theme={theme} />

      <Card theme={theme} className="text-center">
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: theme.sub }}>Valor de la cartera</p>
        <h1 className="mt-1" style={{ fontFamily: FONT_NUM, fontSize: "2.25rem", fontWeight: 700, color: theme.text }}>
          <AnimatedNumber value={hasLive ? liveTotal : total} decimals={2} suffix=" €" />
        </h1>
        <div className="flex items-center justify-center gap-2 mt-1">
          <Delta value={totalGainPct} theme={theme} />
          {totalGainAbs !== 0 && (
            <span className="text-xs font-semibold" style={{ color: totalGainAbs >= 0 ? GREEN : RED }}>
              {totalGainAbs >= 0 ? "+" : ""}{totalGainAbs.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
            </span>
          )}
        </div>
        {hasLive && (
          <div className="flex items-center justify-center gap-1 mt-1.5">
            <span className="rounded-full" style={{ width: 6, height: 6, background: GREEN, animation: "pulseDot 1.8s infinite" }} />
            <span className="text-xs" style={{ color: theme.sub }}>Precios en tiempo real</span>
          </div>
        )}
      </Card>

      {loading ? <Spinner theme={theme} /> : (
        <div className="space-y-3">
          {investments.map((inv) => {
            const q = liveQuotes[inv.ticker];
            const price = q?.price ?? Number(inv.currentPrice);
            const value = Number(inv.quantity) * price;
            const gainPct = Number(inv.avgPrice) ? ((price - Number(inv.avgPrice)) / Number(inv.avgPrice)) * 100 : 0;
            const color = assetColor(inv.ticker);
            const change1d = q?.change1d;
            return (
              <button key={inv.id} onClick={() => setSelectedId(inv.id)} className="w-full text-left">
                <Card theme={theme} className="flex items-center gap-3" style={{ borderLeft: `4px solid ${color}` }}>
                  <div className="rounded-full flex items-center justify-center flex-shrink-0" style={{ width: 42, height: 42, background: color + "20" }}>
                    <span className="text-xs font-bold" style={{ color }}>
                      {inv.ticker.replace("-USD", "").replace("=F", "").slice(0, 4)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: theme.text }}>{inv.name}</p>
                    <p className="text-xs" style={{ color: theme.sub }}>
                      {Number(inv.quantity).toLocaleString("es-ES", { maximumFractionDigits: 6 })} · {price.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {q?.currency ?? ""}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-semibold text-sm" style={{ fontFamily: FONT_NUM, color: theme.text }}>
                      {value.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                    </p>
                    <div className="flex items-center justify-end gap-1.5">
                      <Delta value={gainPct} theme={theme} />
                      {change1d != null && (
                        <span className="text-xs" style={{ color: change1d >= 0 ? GREEN : RED }}>
                          {change1d >= 0 ? "▲" : "▼"}{Math.abs(change1d).toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              </button>
            );
          })}
          {investments.length === 0 && (
            <p className="text-sm text-center py-6" style={{ color: theme.sub }}>Todavía no has registrado inversiones</p>
          )}
        </div>
      )}

      <button onClick={() => setShowAdd(true)} className="w-full flex items-center justify-center gap-2 py-3 rounded-full text-sm font-semibold" style={{ background: theme.surfaceAlt, color: ACCENT }}>
        <Plus size={16} /> Añadir inversión
      </button>

      {showAdd && <AddInvestmentSheet theme={theme} onClose={() => setShowAdd(false)} onSave={handleAdd} saving={saving} error={saveError} />}
    </div>
  );
}
