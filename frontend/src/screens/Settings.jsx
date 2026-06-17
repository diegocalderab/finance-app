import { useState } from "react";
import { Plus, Check, Moon, Sun, Bell, ChevronRight } from "lucide-react";
import { api } from "../lib/api";
import { ACCENT, ICON_MAP, ICON_CHOICES, COLOR_CHOICES } from "../lib/theme";
import { Card, CategoryIcon, Switch, ErrorNote } from "../components/ui";

function Row({ theme, icon: Icon, catIcon, label, right, chevron }) {
  return (
    <div className="flex items-center gap-3 p-4" style={{ borderColor: theme.border }}>
      {catIcon ? <CategoryIcon icon={catIcon.icon} color={catIcon.color} size={16} /> : (
        <div className="rounded-full flex items-center justify-center flex-shrink-0" style={{ width: 30, height: 30, background: ACCENT + "1F" }}>
          <Icon size={15} style={{ color: ACCENT }} />
        </div>
      )}
      <p className="flex-1 text-sm font-medium" style={{ color: theme.text }}>{label}</p>
      {right}
      {chevron && <ChevronRight size={16} style={{ color: theme.sub }} />}
    </div>
  );
}

export default function Settings({ theme, dark, setDark, categories, onCategoriesChanged, user, onLogout }) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("EXPENSE");
  const [icon, setIcon] = useState(ICON_CHOICES[0]);
  const [color, setColor] = useState(COLOR_CHOICES[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notif, setNotif] = useState(true);

  const addCategory = async () => {
    if (!name.trim()) return;
    setSaving(true);
    setError("");
    try {
      await api.createCategory({ name: name.trim(), type, icon, color });
      setName(""); setAdding(false);
      onCategoriesChanged();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const incomeCats = categories.filter((c) => c.type === "INCOME");
  const expenseCats = categories.filter((c) => c.type === "EXPENSE");

  return (
    <div className="px-5 pt-2 pb-6 space-y-5">
      <Card theme={theme} className="p-0 divide-y">
        <Row theme={theme} icon={dark ? Moon : Sun} label="Modo oscuro" right={<Switch on={dark} onClick={() => setDark(!dark)} />} />
        <Row theme={theme} icon={Bell} label="Notificaciones" right={<Switch on={notif} onClick={() => setNotif(!notif)} />} />
      </Card>

      {user && (
        <Card theme={theme} className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold" style={{ color: theme.text }}>{user.name}</p>
            <p className="text-xs" style={{ color: theme.sub }}>{user.email}</p>
          </div>
          <button onClick={onLogout} className="text-sm font-semibold" style={{ color: "#FF3B30" }}>Salir</button>
        </Card>
      )}

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide mb-2 px-1" style={{ color: theme.sub }}>Ingresos</p>
        <Card theme={theme} className="p-0 divide-y">
          {incomeCats.map((c) => <Row key={c.id} theme={theme} catIcon={c} label={c.name} />)}
          {incomeCats.length === 0 && <p className="text-sm p-4" style={{ color: theme.sub }}>Sin categorías</p>}
        </Card>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide mb-2 px-1" style={{ color: theme.sub }}>Gastos</p>
        <Card theme={theme} className="p-0 divide-y">
          {expenseCats.map((c) => <Row key={c.id} theme={theme} catIcon={c} label={c.name} />)}
          {expenseCats.length === 0 && <p className="text-sm p-4" style={{ color: theme.sub }}>Sin categorías</p>}
        </Card>
      </div>

      {!adding ? (
        <button onClick={() => setAdding(true)} className="w-full flex items-center justify-center gap-2 py-3 rounded-full text-sm font-semibold" style={{ background: theme.surfaceAlt, color: ACCENT }}>
          <Plus size={16} /> Nueva categoría
        </button>
      ) : (
        <Card theme={theme} className="space-y-4">
          <div className="flex justify-center">
            <div className="flex rounded-full p-1" style={{ background: theme.surfaceAlt }}>
              {[{ id: "EXPENSE", label: "Gasto" }, { id: "INCOME", label: "Ingreso" }].map((opt) => (
                <button key={opt.id} onClick={() => setType(opt.id)} className="px-5 py-1.5 rounded-full text-sm font-semibold" style={{ background: type === opt.id ? ACCENT : "transparent", color: type === opt.id ? "#FFFFFF" : theme.sub }}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre de la categoría" className="w-full px-4 py-3 rounded-2xl text-sm outline-none" style={{ background: theme.surfaceAlt, color: theme.text }} />
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
          <ErrorNote message={error} theme={theme} />
          <div className="flex gap-2">
            <button onClick={() => setAdding(false)} className="flex-1 py-3 rounded-full text-sm font-semibold" style={{ background: theme.surfaceAlt, color: theme.text }}>Cancelar</button>
            <button onClick={addCategory} disabled={saving} className="flex-1 py-3 rounded-full text-sm font-semibold text-white disabled:opacity-50" style={{ background: ACCENT }}>{saving ? "Guardando..." : "Añadir"}</button>
          </div>
        </Card>
      )}
    </div>
  );
}
