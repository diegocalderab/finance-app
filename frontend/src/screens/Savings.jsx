import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, Plus } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { api } from "../lib/api";
import { fmt, FONT, FONT_NUM, ACCENT } from "../lib/theme";
import { Card, CategoryIcon, AnimatedNumber, CircularProgress, GlassTooltip, Spinner, ErrorNote } from "../components/ui";
import { ContributeSheet, Celebration, CreateGoalSheet } from "../components/sheets";
import Investments from "./Investments";

function GoalCard({ goal, theme, onClick }) {
  const pct = Math.min((goal.current / goal.targetAmount) * 100, 100);
  return (
    <button onClick={onClick} className="w-full text-left rounded-3xl p-5 flex items-center gap-4" style={{ background: theme.surface, boxShadow: theme.shadow, borderLeft: `4px solid ${goal.color}` }}>
      <CategoryIcon icon={goal.icon} color={goal.color} size={20} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate" style={{ color: theme.text }}>{goal.name}</p>
        <p className="text-xs mt-0.5" style={{ color: theme.sub, fontFamily: FONT_NUM }}>
          <AnimatedNumber value={goal.current} suffix=" €" /> de {fmt(goal.targetAmount)} €
        </p>
        <div className="h-1.5 rounded-full mt-2" style={{ background: theme.surfaceAlt }}>
          <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, background: goal.color, transition: "width 900ms cubic-bezier(.4,0,.2,1)" }} />
        </div>
      </div>
      <CircularProgress pct={pct} size={52} stroke={5} color={goal.color} theme={theme}>
        <span className="text-xs font-bold" style={{ color: theme.text, fontFamily: FONT_NUM }}>{Math.round(pct)}%</span>
      </CircularProgress>
    </button>
  );
}

function GoalDetail({ goalId, theme, onBack, onContributed }) {
  const [goal, setGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showContribute, setShowContribute] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [celebrate, setCelebrate] = useState(false);
  const [available, setAvailable] = useState(null);

  const load = () => {
    setLoading(true);
    api.goal(goalId).then(setGoal).finally(() => setLoading(false));
    api.balance().then((b) => setAvailable(b.available)).catch(() => {});
  };
  useEffect(load, [goalId]);

  // Los hooks no pueden ir después de un return condicional — si goal
  // todavía es null en el primer render, useMemo debe seguir llamándose
  // igual (con datos vacíos), o React revienta el árbol entero.
  const cumulative = useMemo(() => {
    if (!goal) return [];
    const sorted = [...goal.contributions].sort((a, b) => (a.date < b.date ? -1 : 1));
    let sum = 0;
    return sorted.map((h) => { sum += Number(h.amount); return { date: new Date(h.date).toLocaleDateString("es-ES", { month: "short" }), value: sum }; });
  }, [goal]);

  if (loading || !goal) return <Spinner theme={theme} />;

  const pct = Math.min((goal.current / goal.targetAmount) * 100, 100);
  const sortedHistory = [...goal.contributions].sort((a, b) => (a.date < b.date ? 1 : -1));

  const monthsSpan = new Set(goal.contributions.map((h) => h.date.slice(0, 7))).size || 1;
  const avgMonthly = goal.contributions.reduce((a, b) => a + Number(b.amount), 0) / monthsSpan;
  const remaining = Math.max(goal.targetAmount - goal.current, 0);
  const monthsNeeded = avgMonthly > 0 ? remaining / avgMonthly : null;
  let estimateLabel = "Añade aportaciones para estimar la fecha";
  if (pct >= 100) estimateLabel = "Meta alcanzada";
  else if (monthsNeeded !== null) {
    const d = new Date();
    d.setMonth(d.getMonth() + Math.ceil(monthsNeeded));
    estimateLabel = d.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
  }

  const handleContribute = async (amount) => {
    setSaving(true);
    setSaveError("");
    try {
      const wasBelow = goal.current < goal.targetAmount;
      await api.contribute(goal.id, { amount, date: new Date().toISOString() });
      setShowContribute(false);
      load();
      onContributed?.();
      if (wasBelow && goal.current + amount >= goal.targetAmount) setTimeout(() => setCelebrate(true), 300);
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <button onClick={onBack} className="flex items-center gap-1 text-sm font-medium" style={{ color: ACCENT }}>
        <ChevronLeft size={18} /> Bolsas
      </button>

      <Card theme={theme} className="text-center" style={{ borderTop: `4px solid ${goal.color}` }}>
        <div className="flex justify-center"><CategoryIcon icon={goal.icon} color={goal.color} size={22} /></div>
        <p className="text-sm font-semibold mt-2" style={{ color: theme.text }}>{goal.name}</p>
        <h1 className="mt-2" style={{ fontFamily: FONT_NUM, fontSize: "2.5rem", fontWeight: 700, color: theme.text }}>
          <AnimatedNumber value={goal.current} suffix=" €" />
        </h1>
        <p className="text-sm" style={{ color: theme.sub }}>de {fmt(goal.targetAmount)} € objetivo</p>
        <div className="h-2.5 rounded-full mt-4" style={{ background: theme.surfaceAlt }}>
          <div className="h-2.5 rounded-full" style={{ width: `${pct}%`, background: goal.color, transition: "width 900ms cubic-bezier(.4,0,.2,1)" }} />
        </div>
        <p className="text-xs mt-2 font-semibold" style={{ color: goal.color }}>{Math.round(pct)}% completado</p>
      </Card>

      {cumulative.length > 0 && (
        <Card theme={theme}>
          <p className="text-sm font-semibold mb-1" style={{ color: theme.text }}>Evolución del ahorro</p>
          <p className="text-xs mb-2" style={{ color: theme.sub }}>Fecha estimada para la meta: <span style={{ color: theme.text, fontWeight: 600 }}>{estimateLabel}</span></p>
          <div style={{ height: 150 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cumulative} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gGoal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={goal.color} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={goal.color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke={theme.border} />
                <XAxis dataKey="date" tick={{ fontFamily: FONT, fontSize: 11, fill: theme.sub }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip content={(p) => <GlassTooltip {...p} theme={theme} />} />
                <Area type="monotone" dataKey="value" stroke={goal.color} strokeWidth={10} strokeOpacity={0.15} fill="none" isAnimationActive={false} />
                <Area type="monotone" dataKey="value" name={goal.name} stroke={goal.color} fill="url(#gGoal)" strokeWidth={2.5} activeDot={{ r: 5, fill: goal.color, stroke: theme.surface, strokeWidth: 2 }} animationDuration={1000} animationEasing="ease-out" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      <Card theme={theme}>
        <p className="text-sm font-semibold mb-3" style={{ color: theme.text }}>Historial de aportaciones</p>
        <div className="space-y-3">
          {sortedHistory.map((h) => (
            <div key={h.id} className="flex items-center justify-between text-sm">
              <span style={{ color: theme.sub }}>{new Date(h.date).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}</span>
              <span className="font-semibold" style={{ color: "#34C759", fontFamily: FONT_NUM }}>+{fmt(h.amount)} €</span>
            </div>
          ))}
          {sortedHistory.length === 0 && <p className="text-sm" style={{ color: theme.sub }}>Todavía sin aportaciones</p>}
        </div>
      </Card>

      <ErrorNote message={saveError} theme={theme} />

      <button onClick={() => setShowContribute(true)} className="w-full py-3.5 rounded-full text-sm font-semibold text-white" style={{ background: goal.color }}>
        Aportar a esta bolsa
      </button>

      {showContribute && <ContributeSheet theme={theme} goal={goal} available={available} onClose={() => setShowContribute(false)} onSave={handleContribute} saving={saving} error={saveError} />}
      {celebrate && <Celebration theme={theme} goal={goal} onClose={() => setCelebrate(false)} />}
    </div>
  );
}

export default function Savings({ theme }) {
  const [segment, setSegment] = useState("bolsas");
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const load = () => {
    setLoading(true);
    api.goals().then(setGoals).catch((err) => setError(err.message)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleCreate = async (payload) => {
    setSaving(true);
    setSaveError("");
    try {
      await api.createGoal(payload);
      setShowCreate(false);
      load();
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (selectedId) {
    return (
      <div className="px-5 pt-2 pb-6">
        <GoalDetail goalId={selectedId} theme={theme} onBack={() => { setSelectedId(null); load(); }} onContributed={load} />
      </div>
    );
  }

  return (
    <div className="px-5 pt-2 pb-6 space-y-4">
      <div className="flex rounded-full p-1" style={{ background: theme.surfaceAlt }}>
        {[{ id: "bolsas", label: "Bolsas" }, { id: "inversiones", label: "Inversiones" }].map((s) => (
          <button key={s.id} onClick={() => setSegment(s.id)} className="flex-1 py-2 rounded-full text-sm font-semibold" style={{ background: segment === s.id ? ACCENT : "transparent", color: segment === s.id ? "#FFFFFF" : theme.sub }}>{s.label}</button>
        ))}
      </div>

      {segment === "bolsas" ? (
        <>
          <ErrorNote message={error} theme={theme} />
          {loading ? <Spinner theme={theme} /> : (
            <div className="space-y-4">
              {goals.map((g) => <GoalCard key={g.id} goal={g} theme={theme} onClick={() => setSelectedId(g.id)} />)}
              {goals.length === 0 && <p className="text-sm text-center py-6" style={{ color: theme.sub }}>Todavía no tienes bolsas de ahorro</p>}
            </div>
          )}
          <button onClick={() => setShowCreate(true)} className="w-full flex items-center justify-center gap-2 py-3 rounded-full text-sm font-semibold" style={{ background: theme.surfaceAlt, color: ACCENT }}>
            <Plus size={16} /> Nueva bolsa
          </button>
          {showCreate && <CreateGoalSheet theme={theme} onClose={() => setShowCreate(false)} onSave={handleCreate} saving={saving} error={saveError} />}
        </>
      ) : (
        <Investments theme={theme} />
      )}
    </div>
  );
}
