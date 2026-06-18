import { useState, useEffect } from "react";
import {
  AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";
import { api } from "../lib/api";
import { ACCENT, GREEN, RED, FONT, FONT_NUM, fmt, pctDelta, lastMonths } from "../lib/theme";
import { Card, Delta, AnimatedNumber, GlassTooltip, Spinner, ErrorNote } from "../components/ui";

export default function Dashboard({ theme, categories }) {
  const months = lastMonths(6);
  const [monthIdx, setMonthIdx] = useState(months.length - 1);
  const [summary, setSummary] = useState(null);
  const [prevSummary, setPrevSummary] = useState(null);
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalBalance, setTotalBalance] = useState(null);

  const selected = months[monthIdx];
  const prev = monthIdx > 0 ? months[monthIdx - 1] : null;

  useEffect(() => {
    api.balance().then(setTotalBalance).catch(() => {});
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    Promise.all([
      api.summary(selected.month, selected.year),
      prev ? api.summary(prev.month, prev.year) : Promise.resolve(null),
      api.trend(monthIdx + 1),
    ])
      .then(([s, ps, t]) => {
        if (!active) return;
        setSummary(s);
        setPrevSummary(ps);
        setTrend(t.map((x) => ({ month: x.month, Ingresos: x.income, Gastos: x.expense })));
      })
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [monthIdx]);

  if (loading && !summary) return <div className="px-5"><Spinner theme={theme} /></div>;

  const balanceDelta = prevSummary ? pctDelta(summary.balance, prevSummary.balance) : null;
  const incomeDelta = prevSummary ? pctDelta(summary.income, prevSummary.income) : null;
  const expenseDelta = prevSummary ? pctDelta(summary.expense, prevSummary.expense) : null;

  const breakdown = Object.entries(summary?.byCategory || {})
    .map(([name, value]) => {
      const cat = categories.find((c) => c.name === name) || {};
      return { name, value, color: cat.color || "#86868B", pct: (value / summary.expense) * 100 };
    })
    .sort((a, b) => b.value - a.value);

  return (
    <div className="px-5 pt-2 pb-6 space-y-5">
      <div className="flex gap-2 overflow-x-auto pb-1" onWheel={(e) => { e.currentTarget.scrollLeft += e.deltaY; }}>
        {months.map((m, i) => (
          <button key={`${m.year}-${m.month}`} onClick={() => setMonthIdx(i)} className="px-4 py-2 rounded-full text-sm font-semibold flex-shrink-0 capitalize transition-colors" style={{ background: i === monthIdx ? ACCENT : theme.surfaceAlt, color: i === monthIdx ? "#FFFFFF" : theme.sub }}>
            {m.label}
          </button>
        ))}
      </div>

      <ErrorNote message={error} theme={theme} />

      {summary && (
        <>
          <div>
            <p className="text-sm font-medium mb-1 capitalize" style={{ color: theme.sub }}>Balance de {selected.label}</p>
            <div className="flex items-end gap-3 flex-wrap">
              <h1 className="tracking-tight" style={{ fontFamily: FONT_NUM, fontSize: "3rem", fontWeight: 700, color: summary.balance >= 0 ? theme.text : RED, lineHeight: 1 }}>
                {summary.balance >= 0 ? "" : "-"}<AnimatedNumber value={Math.abs(summary.balance)} /> €
              </h1>
              <Delta value={balanceDelta} theme={theme} />
            </div>
            {prev && <p className="text-xs mt-1 capitalize" style={{ color: theme.sub }}>vs {prev.label}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Card theme={theme} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: theme.sub }}>Ingresos</span>
                <Delta value={incomeDelta} theme={theme} />
              </div>
              <p style={{ fontFamily: FONT_NUM, fontSize: "1.5rem", fontWeight: 700, color: GREEN }}>{fmt(summary.income)} €</p>
            </Card>
            <Card theme={theme} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: theme.sub }}>Gastos</span>
                <Delta value={expenseDelta} theme={theme} invert />
              </div>
              <p style={{ fontFamily: FONT_NUM, fontSize: "1.5rem", fontWeight: 700, color: RED }}>{fmt(summary.expense)} €</p>
            </Card>
          </div>

          {breakdown.length > 0 ? (
            <Card theme={theme}>
              <p className="text-sm font-semibold mb-3" style={{ color: theme.text }}>Gastos por categoría</p>
              <div className="flex items-center gap-4">
                <div style={{ width: 140, height: 140, flexShrink: 0, position: "relative" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={breakdown} dataKey="value" nameKey="name" innerRadius={42} outerRadius={68} paddingAngle={4} cornerRadius={6} stroke="none" animationDuration={900} animationEasing="ease-out">
                        {breakdown.map((b, i) => <Cell key={i} fill={b.color} />)}
                      </Pie>
                      <Tooltip content={(p) => <GlassTooltip {...p} theme={theme} />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span style={{ fontFamily: FONT_NUM, fontWeight: 700, fontSize: "1.05rem", color: theme.text }}><AnimatedNumber value={summary.expense} /></span>
                    <span style={{ fontSize: "0.65rem", color: theme.sub }}>Total €</span>
                  </div>
                </div>
                <div className="flex-1 space-y-2 min-w-0">
                  {breakdown.slice(0, 5).map((b) => (
                    <div key={b.name} className="flex items-center justify-between text-sm gap-2">
                      <span className="flex items-center gap-2 truncate" style={{ color: theme.text }}>
                        <span className="rounded-full flex-shrink-0" style={{ width: 8, height: 8, background: b.color }} />
                        <span className="truncate">{b.name}</span>
                      </span>
                      <span className="font-semibold flex-shrink-0" style={{ color: theme.sub, fontFamily: FONT_NUM }}>{b.pct.toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ) : (
            <Card theme={theme}><p className="text-sm text-center" style={{ color: theme.sub }}>Sin gastos este mes todavía</p></Card>
          )}

          {trend.length > 1 && (
            <Card theme={theme}>
              <p className="text-sm font-semibold mb-1" style={{ color: theme.text }}>Evolución</p>
              <p className="text-xs mb-2" style={{ color: theme.sub }}>Últimos {trend.length} meses</p>
              <div style={{ height: 160 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gIn" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={GREEN} stopOpacity={0.35} />
                        <stop offset="100%" stopColor={GREEN} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gOut" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={RED} stopOpacity={0.3} />
                        <stop offset="100%" stopColor={RED} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke={theme.border} />
                    <XAxis dataKey="month" tick={{ fontFamily: FONT, fontSize: 11, fill: theme.sub }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip content={(p) => <GlassTooltip {...p} theme={theme} />} />
                    <Area type="monotone" dataKey="Ingresos" stroke={GREEN} strokeWidth={10} strokeOpacity={0.15} fill="none" isAnimationActive={false} />
                    <Area type="monotone" dataKey="Gastos" stroke={RED} strokeWidth={10} strokeOpacity={0.12} fill="none" isAnimationActive={false} />
                    <Area type="monotone" dataKey="Ingresos" stroke={GREEN} fill="url(#gIn)" strokeWidth={2.5} activeDot={{ r: 5, fill: GREEN, stroke: theme.surface, strokeWidth: 2 }} animationDuration={1000} animationEasing="ease-out" />
                    <Area type="monotone" dataKey="Gastos" stroke={RED} fill="url(#gOut)" strokeWidth={2.5} activeDot={{ r: 5, fill: RED, stroke: theme.surface, strokeWidth: 2 }} animationDuration={1000} animationEasing="ease-out" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}

          {prevSummary && (
            <Card theme={theme} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold capitalize" style={{ color: theme.text }}>Este mes vs {prev.label}</p>
                <p className="text-xs mt-0.5" style={{ color: theme.sub }}>Diferencia de balance</p>
              </div>
              <Delta value={balanceDelta} theme={theme} />
            </Card>
          )}

          {totalBalance && (
            <Card theme={theme}>
              <p className="text-sm font-semibold mb-3" style={{ color: theme.text }}>Situación global</p>
              <div className="space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span style={{ color: theme.sub }}>Total ingresos</span>
                  <span style={{ color: GREEN, fontWeight: 600, fontFamily: FONT_NUM }}>{fmt(totalBalance.income)} €</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: theme.sub }}>Total gastos</span>
                  <span style={{ color: RED, fontWeight: 600, fontFamily: FONT_NUM }}>{fmt(totalBalance.expense)} €</span>
                </div>
                {totalBalance.allocated > 0 && (
                  <div className="flex justify-between text-sm">
                    <span style={{ color: theme.sub }}>En bolsas de ahorro</span>
                    <span style={{ color: ACCENT, fontWeight: 600, fontFamily: FONT_NUM }}>{fmt(totalBalance.allocated)} €</span>
                  </div>
                )}
                {totalBalance.invested > 0 && (
                  <div className="flex justify-between text-sm">
                    <span style={{ color: theme.sub }}>Invertido</span>
                    <span style={{ color: ACCENT, fontWeight: 600, fontFamily: FONT_NUM }}>{fmt(totalBalance.invested)} €</span>
                  </div>
                )}
                <div className="h-px" style={{ background: theme.border }} />
                <div className="flex justify-between text-sm">
                  <span className="font-semibold" style={{ color: theme.text }}>Disponible ahora</span>
                  <span style={{ fontWeight: 700, fontFamily: FONT_NUM, color: totalBalance.available >= 0 ? GREEN : RED }}>
                    {fmt(totalBalance.available)} €
                  </span>
                </div>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
