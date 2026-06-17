import { useState, useEffect } from "react";
import { ArrowLeftRight } from "lucide-react";
import { api } from "../lib/api";
import { fmt, pctDelta, GREEN, RED, FONT_NUM, lastMonths } from "../lib/theme";
import { Card, Delta, CategoryIcon, Spinner, ErrorNote } from "../components/ui";

export default function Compare({ theme, categories }) {
  const months = lastMonths(6);
  const [aIdx, setAIdx] = useState(months.length - 2);
  const [bIdx, setBIdx] = useState(months.length - 1);
  const [sa, setSa] = useState(null);
  const [sb, setSb] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    const A = months[aIdx], B = months[bIdx];
    Promise.all([api.summary(A.month, A.year), api.summary(B.month, B.year)])
      .then(([a, b]) => { if (active) { setSa(a); setSb(b); } })
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [aIdx, bIdx]);

  const Select = ({ value, onChange }) => (
    <select value={value} onChange={(e) => onChange(Number(e.target.value))} className="px-3 py-1.5 rounded-full text-sm font-semibold border-none outline-none capitalize" style={{ background: theme.surfaceAlt, color: theme.text }}>
      {months.map((m, i) => <option key={i} value={i}>{m.label}</option>)}
    </select>
  );

  const expenseCats = categories.filter((c) => c.type === "EXPENSE");

  return (
    <div className="px-5 pt-2 pb-6 space-y-5">
      <div className="flex items-center justify-center gap-3">
        <Select value={aIdx} onChange={setAIdx} />
        <ArrowLeftRight size={16} style={{ color: theme.sub }} />
        <Select value={bIdx} onChange={setBIdx} />
      </div>

      <ErrorNote message={error} theme={theme} />
      {loading || !sa || !sb ? <Spinner theme={theme} /> : (
        <>
          <div className="grid grid-cols-2 gap-3">
            {[{ label: months[aIdx].label, s: sa }, { label: months[bIdx].label, s: sb }].map(({ label, s }) => (
              <Card key={label} theme={theme} className="p-4">
                <p className="text-xs font-semibold uppercase tracking-wide mb-3 capitalize" style={{ color: theme.sub }}>{label}</p>
                <div className="space-y-2">
                  <div><p className="text-xs" style={{ color: theme.sub }}>Ingresos</p><p style={{ fontFamily: FONT_NUM, fontWeight: 700, color: GREEN }}>{fmt(s.income)} €</p></div>
                  <div><p className="text-xs" style={{ color: theme.sub }}>Gastos</p><p style={{ fontFamily: FONT_NUM, fontWeight: 700, color: RED }}>{fmt(s.expense)} €</p></div>
                  <div><p className="text-xs" style={{ color: theme.sub }}>Balance</p><p style={{ fontFamily: FONT_NUM, fontWeight: 700, color: theme.text }}>{fmt(s.balance)} €</p></div>
                </div>
              </Card>
            ))}
          </div>

          <Card theme={theme} className="flex items-center justify-between">
            <p className="text-sm font-semibold" style={{ color: theme.text }}>Diferencia de balance</p>
            <Delta value={pctDelta(sb.balance, sa.balance)} theme={theme} />
          </Card>

          <Card theme={theme}>
            <p className="text-sm font-semibold mb-4" style={{ color: theme.text }}>Por categoría</p>
            <div className="space-y-4">
              {expenseCats.map((c) => {
                const va = sa.byCategory[c.name] || 0;
                const vb = sb.byCategory[c.name] || 0;
                if (!va && !vb) return null;
                const max = Math.max(va, vb, 1);
                const diff = pctDelta(vb, va);
                return (
                  <div key={c.id}>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="flex items-center gap-2" style={{ color: theme.text }}>
                        <CategoryIcon icon={c.icon} color={c.color} size={14} />
                        {c.name}
                      </span>
                      <Delta value={diff} theme={theme} invert />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 rounded-full" style={{ background: theme.surfaceAlt }}>
                          <div className="h-2 rounded-full" style={{ width: `${(va / max) * 100}%`, background: theme.sub, transition: "width 600ms cubic-bezier(.4,0,.2,1)" }} />
                        </div>
                        <span className="text-xs w-14 text-right" style={{ color: theme.sub, fontFamily: FONT_NUM }}>{fmt(va)} €</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 rounded-full" style={{ background: theme.surfaceAlt }}>
                          <div className="h-2 rounded-full" style={{ width: `${(vb / max) * 100}%`, background: c.color, transition: "width 600ms cubic-bezier(.4,0,.2,1)" }} />
                        </div>
                        <span className="text-xs w-14 text-right font-semibold" style={{ color: theme.text, fontFamily: FONT_NUM }}>{fmt(vb)} €</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
