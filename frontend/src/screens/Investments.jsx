import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { api } from "../lib/api";
import { fmt, fmt2, pctDelta, GREEN, FONT_NUM } from "../lib/theme";
import { Card, Delta, AnimatedNumber, Spinner, ErrorNote } from "../components/ui";
import { AddInvestmentSheet } from "../components/sheets";

export default function Investments({ theme }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const load = () => {
    setLoading(true);
    api.investments().then(setData).catch((err) => setError(err.message)).finally(() => setLoading(false));
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

  if (loading) return <Spinner theme={theme} />;

  const holdings = data?.investments || [];
  const total = data?.total || 0;
  const totalCost = holdings.reduce((a, h) => a + Number(h.quantity) * Number(h.avgPrice), 0);
  const totalGainPct = totalCost ? ((total - totalCost) / totalCost) * 100 : 0;

  return (
    <div className="space-y-5">
      <ErrorNote message={error} theme={theme} />
      <Card theme={theme} className="text-center">
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: theme.sub }}>Valor de la cartera</p>
        <h1 className="mt-1" style={{ fontFamily: FONT_NUM, fontSize: "2.25rem", fontWeight: 700, color: theme.text }}>
          <AnimatedNumber value={total} decimals={2} suffix=" €" />
        </h1>
        <div className="flex items-center justify-center gap-2 mt-1">
          <Delta value={totalGainPct} theme={theme} />
          <span className="flex items-center gap-1.5 text-xs" style={{ color: theme.sub }}>
            <span className="rounded-full" style={{ width: 6, height: 6, background: GREEN, animation: "pulseDot 1.8s infinite" }} />
            datos manuales
          </span>
        </div>
      </Card>

      <div className="space-y-3">
        {holdings.map((h) => {
          const value = Number(h.quantity) * Number(h.currentPrice);
          const gainPct = Number(h.avgPrice) ? ((Number(h.currentPrice) - Number(h.avgPrice)) / Number(h.avgPrice)) * 100 : 0;
          return (
            <Card key={h.id} theme={theme} className="flex items-center gap-3">
              <div className="rounded-full flex items-center justify-center flex-shrink-0" style={{ width: 40, height: 40, background: "#0071E31F" }}>
                <span className="text-xs font-bold" style={{ color: "#0071E3" }}>{h.ticker.slice(0, 3)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: theme.text }}>{h.name}</p>
                <p className="text-xs" style={{ color: theme.sub }}>{h.quantity} · {fmt2(Number(h.currentPrice))} €</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-semibold" style={{ fontFamily: FONT_NUM, color: theme.text }}>{fmt(value)} €</p>
                <Delta value={gainPct} theme={theme} />
              </div>
            </Card>
          );
        })}
        {holdings.length === 0 && <p className="text-sm text-center py-6" style={{ color: theme.sub }}>Todavía no has registrado inversiones</p>}
      </div>

      <button onClick={() => setShowAdd(true)} className="w-full flex items-center justify-center gap-2 py-3 rounded-full text-sm font-semibold" style={{ background: theme.surfaceAlt, color: "#0071E3" }}>
        <Plus size={16} /> Añadir inversión
      </button>

      <p className="text-xs text-center px-4" style={{ color: theme.sub }}>
        Datos de ejemplo introducidos a mano. Próximamente: cotizaciones en tiempo real conectadas por API.
      </p>

      {showAdd && <AddInvestmentSheet theme={theme} onClose={() => setShowAdd(false)} onSave={handleAdd} saving={saving} error={saveError} />}
    </div>
  );
}
