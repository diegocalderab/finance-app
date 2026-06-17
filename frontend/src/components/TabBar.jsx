import { LayoutDashboard, List, PiggyBank, ArrowLeftRight, Settings } from "lucide-react";
import { ACCENT } from "../lib/theme";

const TABS = [
  { id: "dashboard", label: "Resumen", icon: LayoutDashboard },
  { id: "movements", label: "Movim.", icon: List },
  { id: "savings", label: "Ahorro", icon: PiggyBank },
  { id: "compare", label: "Comparar", icon: ArrowLeftRight },
  { id: "settings", label: "Ajustes", icon: Settings },
];

export default function TabBar({ theme, tab, setTab }) {
  return (
    <div className="sticky bottom-0 left-0 right-0 z-40 flex items-center justify-around pt-2 pb-3" style={{ background: theme.glass, backdropFilter: "blur(20px)", borderTop: `1px solid ${theme.border}` }}>
      {TABS.map((t) => {
        const active = tab === t.id;
        const Icon = t.icon;
        return (
          <button key={t.id} onClick={() => setTab(t.id)} className="flex flex-col items-center gap-1 px-1.5">
            <Icon size={21} style={{ color: active ? ACCENT : theme.sub }} />
            <span className="text-xs font-medium" style={{ color: active ? ACCENT : theme.sub }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}
