import { useState, useEffect } from "react";
import { X, Check, ChevronLeft } from "lucide-react";
import { ACCENT, GREEN, RED, FONT_NUM, ICON_MAP, ICON_CHOICES, COLOR_CHOICES } from "../lib/theme";
import { CategoryIcon, Spinner } from "./ui";
import { api } from "../lib/api";

export function AddTransactionSheet({ theme, onClose, categories, onSave, saving, error }) {
  const incomeCats = categories.filter((c) => c.type === "INCOME");
  const expenseCats = categories.filter((c) => c.type === "EXPENSE");
  const [type, setType] = useState("EXPENSE");
  const cats = type === "EXPENSE" ? expenseCats : incomeCats;
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState(cats[0]?.id);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");

  useEffect(() => { setCategoryId((type === "EXPENSE" ? expenseCats : incomeCats)[0]?.id); }, [type]);

  const handleSave = () => {
    const val = parseFloat(amount.replace(",", "."));
    if (!val || !categoryId) return;
    onSave({ type, amount: val, date, note, categoryId });
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.4)" }} onClick={onClose} />
      <div className="relative rounded-t-3xl p-6 pb-8 space-y-5" style={{ background: theme.surface, boxShadow: "0 -10px 40px rgba(0,0,0,0.25)" }}>
        <div className="flex items-center justify-between">
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: theme.surfaceAlt }}>
            <X size={16} style={{ color: theme.sub }} />
          </button>
          <p className="text-sm font-semibold" style={{ color: theme.text }}>Nuevo movimiento</p>
          <div className="w-8" />
        </div>

        <div className="flex justify-center">
          <div className="flex rounded-full p-1" style={{ background: theme.surfaceAlt }}>
            {[{ id: "EXPENSE", label: "Gasto" }, { id: "INCOME", label: "Ingreso" }].map((opt) => (
              <button key={opt.id} onClick={() => setType(opt.id)} className="px-5 py-1.5 rounded-full text-sm font-semibold" style={{ background: type === opt.id ? (opt.id === "EXPENSE" ? RED : GREEN) : "transparent", color: type === opt.id ? "#FFFFFF" : theme.sub }}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center gap-1">
          <input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" placeholder="0" autoFocus className="text-center bg-transparent outline-none" style={{ fontFamily: FONT_NUM, fontSize: "3rem", fontWeight: 700, color: theme.text, width: "60%" }} />
          <span style={{ fontFamily: FONT_NUM, fontSize: "2rem", fontWeight: 600, color: theme.sub }}>€</span>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {cats.map((c) => (
            <button key={c.id} onClick={() => setCategoryId(c.id)} className="flex flex-col items-center gap-1">
              <div className="rounded-full flex items-center justify-center" style={{ width: 48, height: 48, background: categoryId === c.id ? c.color : theme.surfaceAlt, border: categoryId === c.id ? `2px solid ${c.color}` : "none" }}>
                <CategoryIcon icon={c.icon} color={categoryId === c.id ? "#FFFFFF" : c.color} padded={false} size={18} />
              </div>
              <span className="text-xs truncate w-full text-center" style={{ color: theme.sub }}>{c.name}</span>
            </button>
          ))}
        </div>

        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-4 py-3 rounded-2xl text-sm outline-none" style={{ background: theme.surfaceAlt, color: theme.text }} />
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Nota (opcional)" className="w-full px-4 py-3 rounded-2xl text-sm outline-none" style={{ background: theme.surfaceAlt, color: theme.text }} />

        {error && <p className="text-xs text-center" style={{ color: RED }}>{error}</p>}

        <button onClick={handleSave} disabled={saving} className="w-full py-3.5 rounded-full text-sm font-semibold text-white disabled:opacity-50" style={{ background: ACCENT }}>
          {saving ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </div>
  );
}

export function ContributeSheet({ theme, goal, available, onClose, onSave, saving, error }) {
  const [amount, setAmount] = useState("");
  const hasLimit = typeof available === "number";
  const exceeds = hasLimit && parseFloat((amount || "0").replace(",", ".")) > available;
  const handle = () => {
    const v = parseFloat(amount.replace(",", "."));
    if (!v || (hasLimit && v > available)) return;
    onSave(v);
  };
  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.4)" }} onClick={onClose} />
      <div className="relative rounded-t-3xl p-6 pb-8 space-y-5" style={{ background: theme.surface, boxShadow: "0 -10px 40px rgba(0,0,0,0.25)" }}>
        <div className="flex items-center justify-between">
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: theme.surfaceAlt }}><X size={16} style={{ color: theme.sub }} /></button>
          <p className="text-sm font-semibold" style={{ color: theme.text }}>Aportar a {goal.name}</p>
          <div className="w-8" />
        </div>
        {hasLimit && (
          <p className="text-xs text-center" style={{ color: theme.sub }}>
            Saldo disponible: <span style={{ fontWeight: 600, color: theme.text }}>{available.toLocaleString("es-ES", { maximumFractionDigits: 0 })} €</span>
          </p>
        )}
        <div className="flex items-center justify-center gap-1">
          <input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" placeholder="0" autoFocus className="text-center bg-transparent outline-none" style={{ fontFamily: FONT_NUM, fontSize: "3rem", fontWeight: 700, color: exceeds ? RED : theme.text, width: "60%" }} />
          <span style={{ fontFamily: FONT_NUM, fontSize: "2rem", fontWeight: 600, color: theme.sub }}>€</span>
        </div>
        {exceeds && <p className="text-xs text-center" style={{ color: RED }}>No puedes aportar más de lo que tienes disponible</p>}
        {hasLimit && available <= 0 && <p className="text-xs text-center" style={{ color: RED }}>No tienes saldo disponible para aportar ahora mismo</p>}
        {error && <p className="text-xs text-center" style={{ color: RED }}>{error}</p>}
        <button onClick={handle} disabled={saving || exceeds || (hasLimit && available <= 0)} className="w-full py-3.5 rounded-full text-sm font-semibold text-white disabled:opacity-50" style={{ background: goal.color }}>
          {saving ? "Guardando..." : "Aportar"}
        </button>
      </div>
    </div>
  );
}

const QUICK_PICKS = [
  { symbol: "SPY", name: "S&P 500 (SPY)" },
  { symbol: "BTC-USD", name: "Bitcoin" },
  { symbol: "ETH-USD", name: "Ethereum" },
  { symbol: "QQQ", name: "NASDAQ 100" },
  { symbol: "AAPL", name: "Apple" },
  { symbol: "NVDA", name: "NVIDIA" },
  { symbol: "TSLA", name: "Tesla" },
  { symbol: "GC=F", name: "Oro" },
];

function assetColor(symbol) {
  if (symbol.endsWith("-USD")) return "#FF9500";
  if (symbol.startsWith("^")) return "#AF52DE";
  if (symbol.endsWith("=F")) return "#FFD60A";
  return ACCENT;
}

export function AddInvestmentSheet({ theme, onClose, onSave, saving, error }) {
  const [step, setStep] = useState("search");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [selected, setSelected] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [avgPrice, setAvgPrice] = useState("");

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const t = setTimeout(() => {
      setSearching(true);
      api.marketSearch(query).then(setResults).catch(() => setResults([])).finally(() => setSearching(false));
    }, 400);
    return () => clearTimeout(t);
  }, [query]);

  const selectAsset = async (symbol, name) => {
    setLoadingQuote(true);
    try {
      const q = await api.marketQuote(symbol);
      setSelected({ symbol, name, price: q.price, currency: q.currency });
      setAvgPrice(String(q.price.toFixed(2)));
    } catch {
      setSelected({ symbol, name, price: null, currency: "" });
    } finally {
      setLoadingQuote(false);
      setStep("configure");
    }
  };

  const qty = parseFloat((quantity || "0").replace(",", "."));
  const avg = parseFloat((avgPrice || "0").replace(",", "."));
  const totalCost = qty * avg;
  const totalNow = selected?.price ? qty * selected.price : null;
  const color = selected ? assetColor(selected.symbol) : ACCENT;

  const handle = () => {
    if (!qty || !avg || !selected) return;
    onSave({ name: selected.name, ticker: selected.symbol, quantity: qty, avgPrice: avg, currentPrice: selected.price ?? avg });
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.4)" }} onClick={onClose} />
      <div className="relative rounded-t-3xl p-6 pb-8 space-y-4" style={{ background: theme.surface, boxShadow: "0 -10px 40px rgba(0,0,0,0.25)", maxHeight: "88vh", overflowY: "auto" }}>

        <div className="flex items-center justify-between">
          <button onClick={step === "configure" ? () => setStep("search") : onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: theme.surfaceAlt }}>
            {step === "configure" ? <ChevronLeft size={16} style={{ color: theme.sub }} /> : <X size={16} style={{ color: theme.sub }} />}
          </button>
          <p className="text-sm font-semibold" style={{ color: theme.text }}>
            {step === "search" ? "Añadir inversión" : (selected?.name ?? "Configurar")}
          </p>
          <div className="w-8" />
        </div>

        {step === "search" && (
          <>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Busca acción, ETF o criptomoneda…" autoFocus className="w-full px-4 py-3 rounded-2xl text-sm outline-none" style={{ background: theme.surfaceAlt, color: theme.text }} />

            {!query.trim() && (
              <>
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: theme.sub }}>Más populares</p>
                <div className="grid grid-cols-2 gap-2">
                  {QUICK_PICKS.map((q) => (
                    <button key={q.symbol} onClick={() => selectAsset(q.symbol, q.name)} className="flex items-center gap-2.5 px-3 py-2.5 rounded-2xl text-left" style={{ background: theme.surfaceAlt }}>
                      <span className="text-xs font-bold px-1.5 py-0.5 rounded-lg flex-shrink-0" style={{ background: assetColor(q.symbol) + "20", color: assetColor(q.symbol) }}>
                        {q.symbol.replace("-USD", "").replace("=F", "").slice(0, 4)}
                      </span>
                      <span className="text-sm font-medium truncate" style={{ color: theme.text }}>{q.name}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {query.trim() && (
              <div className="space-y-1.5">
                {searching && <Spinner theme={theme} />}
                {results.map((r) => (
                  <button key={r.symbol} onClick={() => selectAsset(r.symbol, r.name)} className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-left" style={{ background: theme.surfaceAlt }}>
                    <span className="text-xs font-bold px-2 py-1 rounded-lg flex-shrink-0" style={{ background: assetColor(r.symbol) + "20", color: assetColor(r.symbol) }}>
                      {r.symbol.slice(0, 5)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: theme.text }}>{r.name}</p>
                      <p className="text-xs" style={{ color: theme.sub }}>{r.type} · {r.exchange}</p>
                    </div>
                  </button>
                ))}
                {!searching && results.length === 0 && (
                  <p className="text-sm text-center py-4" style={{ color: theme.sub }}>Sin resultados para "{query}"</p>
                )}
              </div>
            )}

            {loadingQuote && <Spinner theme={theme} />}
          </>
        )}

        {step === "configure" && selected && (
          <>
            {selected.price != null && (
              <div className="flex items-center justify-between px-4 py-3 rounded-2xl" style={{ background: color + "15" }}>
                <span className="text-xs font-bold" style={{ color }}>{selected.symbol}</span>
                <span className="text-sm font-semibold" style={{ color: theme.text }}>
                  {selected.price.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {selected.currency}
                </span>
              </div>
            )}

            <div>
              <p className="text-xs font-semibold mb-1.5" style={{ color: theme.sub }}>Cantidad / unidades</p>
              <input value={quantity} onChange={(e) => setQuantity(e.target.value)} inputMode="decimal" placeholder="ej. 10" autoFocus className="w-full px-4 py-3 rounded-2xl text-sm outline-none" style={{ background: theme.surfaceAlt, color: theme.text }} />
            </div>

            <div>
              <p className="text-xs font-semibold mb-1.5" style={{ color: theme.sub }}>Precio medio de compra {selected.currency ? `(${selected.currency})` : ""}</p>
              <input value={avgPrice} onChange={(e) => setAvgPrice(e.target.value)} inputMode="decimal" className="w-full px-4 py-3 rounded-2xl text-sm outline-none" style={{ background: theme.surfaceAlt, color: theme.text }} />
            </div>

            {qty > 0 && avg > 0 && (
              <div className="rounded-2xl px-4 py-3 space-y-1.5" style={{ background: theme.surfaceAlt }}>
                <div className="flex justify-between text-sm">
                  <span style={{ color: theme.sub }}>Invertido</span>
                  <span style={{ fontWeight: 600, color: theme.text, fontFamily: FONT_NUM }}>{totalCost.toLocaleString("es-ES", { maximumFractionDigits: 2 })} {selected.currency}</span>
                </div>
                {totalNow != null && (
                  <div className="flex justify-between text-sm">
                    <span style={{ color: theme.sub }}>Valor actual</span>
                    <span style={{ fontWeight: 600, fontFamily: FONT_NUM, color: totalNow >= totalCost ? "#34C759" : "#FF3B30" }}>
                      {totalNow.toLocaleString("es-ES", { maximumFractionDigits: 2 })} {selected.currency}
                    </span>
                  </div>
                )}
              </div>
            )}

            {error && <p className="text-xs text-center" style={{ color: RED }}>{error}</p>}

            <button onClick={handle} disabled={saving || !qty || !avg} className="w-full py-3.5 rounded-full text-sm font-semibold text-white disabled:opacity-50" style={{ background: color }}>
              {saving ? "Guardando..." : "Añadir a mi cartera"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export function Celebration({ theme, goal, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 2200); return () => clearTimeout(t); }, []);
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.45)" }} onClick={onClose}>
      <div className="rounded-3xl p-8 flex flex-col items-center text-center" style={{ background: theme.surface, boxShadow: theme.shadow, animation: "popIn 450ms cubic-bezier(.34,1.56,.64,1)" }}>
        <div className="rounded-full flex items-center justify-center mb-3" style={{ width: 64, height: 64, background: goal.color + "1F" }}>
          <Check size={32} style={{ color: goal.color }} />
        </div>
        <p className="font-bold" style={{ color: theme.text, fontSize: "1.1rem" }}>Meta alcanzada</p>
        <p className="text-sm mt-1" style={{ color: theme.sub }}>{goal.name} ya está completa</p>
      </div>
    </div>
  );
}

export function CreateGoalSheet({ theme, onClose, onSave, saving, error }) {
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [icon, setIcon] = useState(ICON_CHOICES[0]);
  const [color, setColor] = useState(COLOR_CHOICES[0]);

  const handle = () => {
    const v = parseFloat(target.replace(",", "."));
    if (!name.trim() || !v) return;
    onSave({ name: name.trim(), icon, color, targetAmount: v });
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.4)" }} onClick={onClose} />
      <div className="relative rounded-t-3xl p-6 pb-8 space-y-4" style={{ background: theme.surface, boxShadow: "0 -10px 40px rgba(0,0,0,0.25)" }}>
        <div className="flex items-center justify-between">
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: theme.surfaceAlt }}><X size={16} style={{ color: theme.sub }} /></button>
          <p className="text-sm font-semibold" style={{ color: theme.text }}>Nueva bolsa de ahorro</p>
          <div className="w-8" />
        </div>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre (ej. Viaje a Japón)" className="w-full px-4 py-3 rounded-2xl text-sm outline-none" style={{ background: theme.surfaceAlt, color: theme.text }} />
        <div className="flex items-center justify-center gap-1">
          <input value={target} onChange={(e) => setTarget(e.target.value)} inputMode="decimal" placeholder="0" className="text-center bg-transparent outline-none" style={{ fontFamily: FONT_NUM, fontSize: "2.5rem", fontWeight: 700, color: theme.text, width: "60%" }} />
          <span style={{ fontFamily: FONT_NUM, fontSize: "1.75rem", fontWeight: 600, color: theme.sub }}>€ meta</span>
        </div>
        <div>
          <p className="text-xs font-semibold mb-2" style={{ color: theme.sub }}>Icono</p>
          <div className="flex gap-2 flex-wrap">
            {ICON_CHOICES.map((ic) => {
              const Ic = ICON_MAP[ic];
              return (
                <button key={ic} onClick={() => setIcon(ic)} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: icon === ic ? color : theme.surfaceAlt, border: icon === ic ? `2px solid ${color}` : "none" }}>
                  <Ic size={16} style={{ color: icon === ic ? "#FFFFFF" : theme.sub }} />
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold mb-2" style={{ color: theme.sub }}>Color</p>
          <div className="flex gap-2 flex-wrap">
            {COLOR_CHOICES.map((c) => (
              <button key={c} onClick={() => setColor(c)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: c }}>
                {color === c && <Check size={14} color="#FFFFFF" />}
              </button>
            ))}
          </div>
        </div>
        {error && <p className="text-xs text-center" style={{ color: RED }}>{error}</p>}
        <button onClick={handle} disabled={saving} className="w-full py-3.5 rounded-full text-sm font-semibold text-white disabled:opacity-50" style={{ background: ACCENT }}>
          {saving ? "Creando..." : "Crear bolsa"}
        </button>
      </div>
    </div>
  );
}
