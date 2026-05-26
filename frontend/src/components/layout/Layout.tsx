import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Bell, Search, User, Globe, FolderPlus, ChevronDown, Trash2, Pencil } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useUrbanStore } from "@/store/useUrbanStore";
import { ProjectModal } from "../dashboard/ProjectModal";

export function Layout({ children }: { children: React.ReactNode }) {
  const { projects, activeProjectId, selectProject, deleteProject } = useUrbanStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [editProjectId, setEditProjectId] = useState<string | null>(null);

  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0];

  return (
    <div className="min-h-screen bg-background font-sans antialiased text-foreground selection:bg-primary/30 selection:text-white">
      <Sidebar />
      
      <ProjectModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setEditProjectId(null);
        }} 
        editProjectId={editProjectId}
      />

      <div className="pl-64 flex flex-col min-h-screen">
        <header className="h-14 border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-[1000] flex items-center justify-between px-10 transition-fast">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-6 text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
              <div className="flex items-center gap-2">
                <Globe className="w-3 h-3 text-primary" />
                <span>SÃO PAULO / SP</span>
              </div>
              <span className="opacity-10 text-lg font-light">|</span>
              
              {/* Project Selector Dropdown */}
              {activeProject && (
                <div className="relative">
                  <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 text-foreground font-sans font-bold capitalize hover:text-primary transition-fast tracking-normal text-xs bg-muted/30 px-3 py-1.5 rounded border border-border/60"
                  >
                    <span className="max-w-[200px] truncate">{activeProject.name}</span>
                    <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                  </button>

                  {isDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
                      <div className="absolute left-0 mt-1.5 w-72 bg-card border border-border rounded-lg shadow-xl py-2 z-20 animate-in fade-in slide-in-from-top-1 duration-150">
                        <div className="px-3 pb-2 mb-1.5 border-b border-border flex items-center justify-between">
                          <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider">Estudos de Clientes</span>
                          <button 
                            onClick={() => {
                              setEditProjectId(null);
                              setIsModalOpen(true);
                              setIsDropdownOpen(false);
                            }}
                            className="p-1 text-primary hover:bg-primary/10 rounded flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider transition-fast"
                          >
                            <FolderPlus className="w-3 h-3" />
                            <span>Criar</span>
                          </button>
                        </div>
                        <div className="max-h-60 overflow-y-auto space-y-0.5 px-1.5">
                          {projects.map((p) => (
                            <div 
                              key={p.id}
                              className={`flex items-center justify-between p-2 rounded cursor-pointer transition-fast group ${
                                p.id === activeProjectId 
                                  ? 'bg-primary/10 text-primary' 
                                  : 'hover:bg-muted text-foreground'
                              }`}
                            >
                              <div 
                                className="flex-1 min-w-0 pr-2"
                                onClick={() => {
                                  selectProject(p.id);
                                  setIsDropdownOpen(false);
                                }}
                              >
                                <div className="text-xs font-bold truncate capitalize font-sans">{p.name}</div>
                                <div className="text-[9px] font-mono opacity-60 uppercase">{p.segment}</div>
                              </div>
                              <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditProjectId(p.id);
                                    setIsModalOpen(true);
                                    setIsDropdownOpen(false);
                                  }}
                                  className="p-1 hover:text-primary rounded hover:bg-primary/10 text-muted-foreground transition-fast"
                                  title="Editar Estudo"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                {projects.length > 1 && (
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteProject(p.id);
                                    }}
                                    className="p-1 hover:text-red-500 rounded hover:bg-red-500/10 text-muted-foreground transition-fast"
                                    title="Excluir Estudo"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
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
