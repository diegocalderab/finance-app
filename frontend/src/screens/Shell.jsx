import { useState, useEffect } from "react";
import { api, setToken } from "../lib/api";
import { LIGHT, DARK, FONT, FONT_NUM } from "../lib/theme";
import TabBar from "../components/TabBar";
import Dashboard from "./Dashboard";
import Movements from "./Movements";
import Savings from "./Savings";
import Compare from "./Compare";
import Settings from "./Settings";

const GLOBAL_CSS = `
  @keyframes tooltipIn{from{opacity:0;transform:scale(.92) translateY(4px)}to{opacity:1;transform:scale(1) translateY(0)}}
  @keyframes pulseDot{0%{box-shadow:0 0 0 0 rgba(52,199,89,.5)}70%{box-shadow:0 0 0 6px rgba(52,199,89,0)}100%{box-shadow:0 0 0 0 rgba(52,199,89,0)}}
  @keyframes popIn{0%{transform:scale(.4);opacity:0}60%{transform:scale(1.08)}100%{transform:scale(1);opacity:1}}
`;

export default function Shell({ user, onLogout }) {
  const [dark, setDark] = useState(() => localStorage.getItem("dark") === "1");
  const [tab, setTab] = useState("dashboard");
  const [categories, setCategories] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const theme = dark ? DARK : LIGHT;

  useEffect(() => { localStorage.setItem("dark", dark ? "1" : "0"); }, [dark]);

  const loadCategories = () => api.categories().then(setCategories).catch(() => {});
  useEffect(() => { loadCategories(); }, []);

  const titles = { dashboard: "Resumen", movements: "Movimientos", savings: "Ahorro", compare: "Comparar", settings: "Ajustes" };

  const logout = () => {
    setToken(null);
    onLogout();
  };

  return (
    <div className="min-h-screen w-full flex justify-center" style={{ background: dark ? "#000000" : "#E8E8ED", fontFamily: FONT }}>
      <style>{GLOBAL_CSS}</style>
      <div className="w-full max-w-md relative flex flex-col sm:my-6 sm:rounded-3xl sm:overflow-hidden sm:shadow-2xl" style={{ background: theme.bg, minHeight: "100vh" }}>
        <div className="px-5 pt-6 pb-1">
          <h2 className="font-bold tracking-tight" style={{ fontFamily: FONT_NUM, fontSize: "1.75rem", color: theme.text }}>{titles[tab]}</h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          {tab === "dashboard" && <Dashboard theme={theme} categories={categories} />}
          {tab === "movements" && <Movements theme={theme} categories={categories} refreshKey={refreshKey} onChanged={() => setRefreshKey((k) => k + 1)} />}
          {tab === "savings" && <Savings theme={theme} />}
          {tab === "compare" && <Compare theme={theme} categories={categories} />}
          {tab === "settings" && <Settings theme={theme} dark={dark} setDark={setDark} categories={categories} onCategoriesChanged={loadCategories} user={user} onLogout={logout} />}
        </div>

        <TabBar theme={theme} tab={tab} setTab={setTab} />
      </div>
    </div>
  );
}
