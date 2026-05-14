import React from "react";
import { Sidebar } from "./Sidebar";
import { Bell, Search, User, Globe } from "lucide-react";
import logo from "@/assets/urbanis_logo_transparent.png";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background font-sans antialiased text-foreground selection:bg-primary/30 selection:text-white">
      <Sidebar />

      <div className="pl-64 flex flex-col min-h-screen">
        <header className="h-14 border-b border-border bg-[#16181B]/80 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-10 transition-fast">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-6 text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
              <div className="flex items-center gap-2">
                <Globe className="w-3 h-3 text-primary" />
                <span>SÃO PAULO / SP</span>
              </div>
              <span className="opacity-10 text-lg font-light">|</span>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-foreground font-bold">Painel Territorial</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="h-9 w-9 flex items-center justify-center text-muted-foreground hover:text-foreground transition-fast border border-transparent hover:border-border rounded-md">
              <Search className="w-4 h-4" />
            </button>
            <button className="h-9 w-9 flex items-center justify-center text-muted-foreground hover:text-foreground transition-fast border border-transparent hover:border-border rounded-md relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 h-1.5 w-1.5 bg-primary rounded-full"></span>
            </button>
            <div className="h-8 w-8 ml-2 rounded bg-primary border border-primary/20 flex items-center justify-center cursor-pointer transition-fast hover:brightness-110">
              <User className="w-4 h-4 text-white" />
            </div>
          </div>
        </header>

        <main className="flex-1 p-10 max-w-[1600px] mx-auto w-full">
          {children}
        </main>

        <footer className="h-12 border-t border-border bg-[#101113] flex items-center justify-between px-10">
          <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">© 2026 PLATAFORMA URBANIS</span>
          <div className="flex gap-6 text-[9px] font-mono text-muted-foreground uppercase tracking-widest">
            <a href="#" className="hover:text-primary transition-fast">Status do Sistema: Estável</a>
            <a href="#" className="hover:text-primary transition-fast">v2.4.1</a>
          </div>
        </footer>
      </div>
    </div>
  );
}
