import { useUrbanStore, PROFILES } from "@/store/useUrbanStore";
import { Map, BarChart3, Settings, Target } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import logo from "@/assets/urbanis_logo_transparent.png";

export function Sidebar() {
  const { projects, activeProjectId } = useUrbanStore();
  const location = useLocation();

  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0];
  const profileData = activeProject ? PROFILES[activeProject.profile] : null;

  const navItems = [
    { label: "Visão Geral", to: "/dashboard", icon: BarChart3 },
    { label: "Comparar Distritos", to: "/compare", icon: Map },
  ];

  return (
    <aside className="w-64 border-r border-white/5 bg-[#101113] text-slate-200 h-screen flex flex-col fixed left-0 top-0 z-[1001] transition-fast">
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

      {activeProject && (
        <div className="p-6 border-t border-white/5 bg-[#16181B]/40 space-y-4">
          <div className="flex items-center gap-2">
            <Settings className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[10px] font-mono font-bold uppercase text-slate-500 tracking-widest">
              Contexto do Projeto
            </span>
          </div>

          <div className="space-y-3.5">
            {/* Perfil */}
            <div className="space-y-1">
              <div className="text-[9px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1.5">
                <Target className="w-3 h-3 text-primary" />
                Perfil Ativo
              </div>
              <div className="text-xs font-semibold text-white truncate">
                {profileData?.displayName || "Nenhum"}
              </div>
            </div>

            {/* Objetivo */}
            <div className="space-y-1">
              <div className="text-[9px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1.5">
                <Map className="w-3 h-3 text-emerald-500" />
                Objetivo do Estudo
              </div>
              <div className="text-xs font-semibold text-slate-300 line-clamp-2 leading-relaxed" title={activeProject.strategicGoal}>
                {activeProject.strategicGoal}
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
