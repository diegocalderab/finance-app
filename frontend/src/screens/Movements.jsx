import { useState, useEffect, useMemo } from "react";
import { Plus } from "lucide-react";
import { api } from "../lib/api";
import { fmt2, weekday } from "../lib/theme";
import { Card, CategoryIcon, Spinner, ErrorNote } from "../components/ui";
import { AddTransactionSheet } from "../components/sheets";
import { GREEN, RED, FONT_NUM } from "../lib/theme";

export default function Movements({ theme, categories, refreshKey, onChanged }) {
  const [months, setMonths] = useState([]);
  const [monthIdx, setMonthIdx] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [showSheet, setShowSheet] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Carga los meses que tienen transacciones (solo una vez al montar).
  useEffect(() => {
    api.transactionMonths().then((ms) => {
      setMonths(ms);
      setMonthIdx(0); // el más reciente primero
    }).catch(() => {});
  }, []);

  const selected = months[monthIdx];

  const load = () => {
    if (!selected) return;
    setLoading(true);
    api.transactions(selected.month, selected.year)
      .then(setTransactions)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [selected, refreshKey]);

  const filtered = transactions.filter((t) => filter === "all" || filter === t.type || filter === t.categoryId);
  const grouped = useMemo(() => {
    const g = {};
    filtered.forEach((t) => { (g[t.date.slice(0, 10)] = g[t.date.slice(0, 10)] || []).push(t); });
    return Object.entries(g).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [filtered]);

  const chips = [
    { id: "all", label: "Todos" },
    { id: "INCOME", label: "Ingresos" },
    { id: "EXPENSE", label: "Gastos" },
    ...categories.filter((c) => c.type === "EXPENSE").map((c) => ({ id: c.id, label: c.name })),
  ];

  const handleSave = async (payload) => {
    setSaving(true);
    setSaveError("");
    try {
      await api.createTransaction(payload);
      setShowSheet(false);
      // Recarga meses por si el nuevo movimiento abre un mes nuevo.
      const ms = await api.transactionMonths();
      setMonths(ms);
      setMonthIdx(0);
      onChanged?.();
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-5 pt-2 pb-6">
      {/* Selector de mes — solo los meses que tienen datos */}
      <div className="flex gap-2 overflow-x-auto pb-3" onWheel={(e) => { e.currentTarget.scrollLeft += e.deltaY; }}>
        {months.map((m, i) => (
          <button
            key={`${m.year}-${m.month}`}
            onClick={() => { setMonthIdx(i); setFilter("all"); }}
            className="px-4 py-2 rounded-full text-sm font-semibold flex-shrink-0 capitalize transition-colors"
            style={{ background: i === monthIdx ? "#0071E3" : theme.surfaceAlt, color: i === monthIdx ? "#FFFFFF" : theme.sub }}
          >
            {m.label} {m.year}
          </button>
        ))}
        {months.length === 0 && (
          <p className="text-sm py-2" style={{ color: theme.sub }}>Sin movimientos todavía</p>
        )}
      </div>

      {/* Chips de filtro */}
      <div className="flex gap-2 overflow-x-auto pb-3" onWheel={(e) => { e.currentTarget.scrollLeft += e.deltaY; }}>
        {chips.map((c) => (
          <button key={c.id} onClick={() => setFilter(c.id)} className="px-3.5 py-1.5 rounded-full text-sm font-medium flex-shrink-0" style={{ background: filter === c.id ? "#0071E3" : theme.surfaceAlt, color: filter === c.id ? "#FFFFFF" : theme.sub }}>
            {c.label}
          </button>
        ))}
      </div>

      <ErrorNote message={error} theme={theme} />
      {loading ? <Spinner theme={theme} /> : (
        <div className="space-y-5">
          {grouped.map(([date, items]) => (
            <div key={date}>
              <p className="text-xs font-semibold uppercase tracking-wide mb-2 capitalize" style={{ color: theme.sub }}>{weekday(date)}</p>
              <Card theme={theme} className="p-0 divide-y">
                {items.map((t) => {
                  const cat = categories.find((c) => c.id === t.categoryId) || categories[0] || {};
                  return (
                    <div key={t.id} className="flex items-center gap-3 p-4" style={{ borderColor: theme.border }}>
                      <CategoryIcon icon={cat.icon} color={cat.color} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: theme.text }}>{t.note || cat.name}</p>
                        <p className="text-xs" style={{ color: theme.sub }}>{cat.name}</p>
                      </div>
                      <p className="font-semibold flex-shrink-0" style={{ fontFamily: FONT_NUM, color: t.type === "INCOME" ? GREEN : RED }}>
                        {t.type === "INCOME" ? "+" : "-"}{fmt2(Number(t.amount))} €
                      </p>
                    </div>
                  );
                })}
              </Card>
            </div>
          ))}
          {grouped.length === 0 && months.length > 0 && (
            <p className="text-sm text-center py-10" style={{ color: theme.sub }}>Sin movimientos con este filtro</p>
          )}
        </div>
      )}

      <button onClick={() => setShowSheet(true)} className="absolute z-50 flex items-center justify-center rounded-full text-white" style={{ width: 56, height: 56, right: 20, bottom: 96, background: "#0071E3", boxShadow: "0 8px 20px rgba(0,113,227,0.4)" }}>
        <Plus size={24} />
      </button>

      {showSheet && (
        <AddTransactionSheet
          theme={theme}
          categories={categories}
          onClose={() => setShowSheet(false)}
          onSave={handleSave}
          saving={saving}
          error={saveError}
        />
      )}
    </div>
  );
}
