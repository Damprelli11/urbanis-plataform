import { useUrbanStore } from "@/store/useUrbanStore";
import { SEGMENTS } from "@/config/segments";
import { Map, BarChart3, Settings, ShieldAlert } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import logo from "@/assets/urbanis_logo_transparent.png";

export function Sidebar() {
  const { selectedSegment, setSegment, theme } = useUrbanStore();
  const location = useLocation();

  const navItems = [
    { label: "Visão Geral", to: "/dashboard", icon: BarChart3 },
    { label: "Comparar Distritos", to: "/compare", icon: Map },
  ];

  return (
    <aside className="w-64 border-r border-white/5 bg-[#101113] text-slate-200 h-screen flex flex-col fixed left-0 top-0 z-50 transition-fast">
      <div className="p-8 pb-4 flex justify-start">
        <img src={logo} alt="Urbanis Logo" className="h-13 w-auto object-contain brightness-110" />
      </div>

      <nav className="flex-1 mt-8">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-8 py-3.5 font-medium text-sm transition-fast relative ${isActive
                ? 'bg-primary/10 text-primary border-l-4 border-primary'
                : 'text-slate-400 hover:text-white hover:bg-white/5 border-l-4 border-transparent'
                }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-white/5 bg-[#16181B]/40">
        <div className="mb-4 flex items-center gap-2">
          <Settings className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-[10px] font-mono font-bold uppercase text-slate-500 tracking-widest">
            Configuração
          </span>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[9px] uppercase font-bold text-slate-500 tracking-tighter">Segmento de Mercado</label>
            <select
              value={selectedSegment}
              onChange={(e) => setSegment(e.target.value)}
              className="w-full h-10 rounded-md border border-white/10 bg-[#101113] px-3 py-1 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary transition-fast appearance-none cursor-pointer text-slate-200"
            >
              {Object.keys(SEGMENTS).map((segment) => (
                <option key={segment} value={segment}>
                  {segment.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="p-4 bg-[#101113] border border-white/10 rounded-lg">
            <div className="flex items-center gap-2 text-[9px] font-bold uppercase text-primary mb-2 tracking-widest">
              <ShieldAlert className="w-3.5 h-3.5" />
              Sensibilidade ao Risco
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-mono font-bold text-white leading-none">
                {(SEGMENTS[selectedSegment]?.alpha || 0) * 100}
              </span>
              <span className="text-xs font-mono text-slate-500">%</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
