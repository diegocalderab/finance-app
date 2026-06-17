import { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import { ACCENT, GREEN, RED, FONT_NUM, ICON_MAP, ICON_CHOICES, COLOR_CHOICES } from "../lib/theme";
import { CategoryIcon } from "./ui";

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

export function AddInvestmentSheet({ theme, onClose, onSave, saving, error }) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const handle = () => {
    const v = parseFloat(amount.replace(",", "."));
    if (!name.trim() || !v) return;
    onSave({ name: name.trim(), ticker: name.trim().toUpperCase().slice(0, 6), quantity: 1, avgPrice: v, currentPrice: v });
  };
  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.4)" }} onClick={onClose} />
      <div className="relative rounded-t-3xl p-6 pb-8 space-y-4" style={{ background: theme.surface, boxShadow: "0 -10px 40px rgba(0,0,0,0.25)" }}>
        <div className="flex items-center justify-between">
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: theme.surfaceAlt }}><X size={16} style={{ color: theme.sub }} /></button>
          <p className="text-sm font-semibold" style={{ color: theme.text }}>Nueva inversión</p>
          <div className="w-8" />
        </div>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Dónde se invirtió (ej. VOO, Bitcoin)" className="w-full px-4 py-3 rounded-2xl text-sm outline-none" style={{ background: theme.surfaceAlt, color: theme.text }} />
        <div className="flex items-center justify-center gap-1">
          <input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" placeholder="0" className="text-center bg-transparent outline-none" style={{ fontFamily: FONT_NUM, fontSize: "2.5rem", fontWeight: 700, color: theme.text, width: "60%" }} />
          <span style={{ fontFamily: FONT_NUM, fontSize: "1.75rem", fontWeight: 600, color: theme.sub }}>€</span>
        </div>
        {error && <p className="text-xs text-center" style={{ color: RED }}>{error}</p>}
        <button onClick={handle} disabled={saving} className="w-full py-3.5 rounded-full text-sm font-semibold text-white disabled:opacity-50" style={{ background: ACCENT }}>
          {saving ? "Guardando..." : "Registrar inversión"}
        </button>
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
