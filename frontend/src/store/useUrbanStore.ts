import { create } from 'zustand';
import type { DistrictData } from '../types';
import rawData from '../data/urbanis_data.json';

// Import raw Segment Profiles JSON (Standard MCDA / WLC configs)
import restaurantPremium from '../config/profiles/restaurant-premium.json';
import retailPopular from '../config/profiles/retail-popular.json';
import logisticsLastmile from '../config/profiles/logistics-lastmile.json';
import pharmacyPopular from '../config/profiles/pharmacy-popular.json';
import pharmacyPremium from '../config/profiles/pharmacy-premium.json';
import gymPopular from '../config/profiles/gym-popular.json';
import gymPremium from '../config/profiles/gym-premium.json';

export interface Project {
  id: string;
  name: string;
  segment: string;
  profile: string;
  strategicGoal: string;
}

export const PROFILES: Record<string, {
  profile: string;
  displayName: string;
  weights: {
    infra: { dens: number; mob: number };
    market: { central: number; pop: number; idade: number };
    risk: { crime: number; socio: number };
    balance: { infra: number; market: number };
    alpha: number;
  }
}> = {
  "restaurant-premium": restaurantPremium,
  "retail-popular": retailPopular,
  "logistics-lastmile": logisticsLastmile,
  "pharmacy-popular": pharmacyPopular,
  "pharmacy-premium": pharmacyPremium,
  "gym-popular": gymPopular,
  "gym-premium": gymPremium
};

const DEFAULT_PROJECTS: Project[] = [
  {
    id: "default-1",
    name: "Estudo de Aderência — Drogaria Popular Centro",
    segment: "Farmácia Popular",
    profile: "pharmacy-popular",
    strategicGoal: "Capilaridade e Proximidade Residencial em São Paulo"
  }
];

interface UrbanStore {
  projects: Project[];
  activeProjectId: string;
  districts: DistrictData[];
  theme: 'dark' | 'light';
  activeMapLayer: 'score' | 'crime' | 'age' | 'mobility';
  
  createProject: (project: Omit<Project, 'id'>) => void;
  updateProject: (id: string, project: Omit<Project, 'id'>) => void;
  selectProject: (id: string) => void;
  deleteProject: (id: string) => void;
  setActiveMapLayer: (layer: 'score' | 'crime' | 'age' | 'mobility') => void;
  calculateScores: () => void;
  toggleTheme: () => void;
  initTheme: () => void;
}

// Load saved data or fallback to defaults
const loadSavedProjects = (): Project[] => {
  const saved = localStorage.getItem('urbanis-projects');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const hasValidProfiles = parsed.every(p => p && p.profile && PROFILES[p.profile]);
        if (hasValidProfiles) return parsed;
        
        console.warn("Limpando projetos legados incompatíveis do localStorage.");
        localStorage.removeItem('urbanis-projects');
        localStorage.removeItem('urbanis-active-project-id');
      }
    } catch (e) {
      console.error("Erro ao carregar projetos do localStorage", e);
    }
  }
  return DEFAULT_PROJECTS;
};

const loadSavedActiveProjectId = (projects: Project[]): string => {
  const savedActive = localStorage.getItem('urbanis-active-project-id');
  if (savedActive && projects.some(p => p.id === savedActive)) {
    return savedActive;
  }
  return projects[0].id;
};

export const useUrbanStore = create<UrbanStore>((set, get) => ({
  projects: loadSavedProjects(),
  activeProjectId: "", // will be initialized below
  districts: [],
  theme: (localStorage.getItem('urbanis-theme') as 'dark' | 'light') || 'dark',
  activeMapLayer: 'score',

  createProject: (projData) => {
    const newProject: Project = {
      ...projData,
      id: "proj-" + Date.now()
    };
    const updatedProjects = [...get().projects, newProject];
    localStorage.setItem('urbanis-projects', JSON.stringify(updatedProjects));
    localStorage.setItem('urbanis-active-project-id', newProject.id);
    
    set({ 
      projects: updatedProjects,
      activeProjectId: newProject.id 
    });
    
    get().calculateScores();
  },

  updateProject: (id, projData) => {
    const updatedProjects = get().projects.map(p => p.id === id ? { ...p, ...projData } : p);
    localStorage.setItem('urbanis-projects', JSON.stringify(updatedProjects));
    set({ projects: updatedProjects });
    get().calculateScores();
  },

  selectProject: (id) => {
    if (!get().projects.some(p => p.id === id)) return;
    localStorage.setItem('urbanis-active-project-id', id);
    set({ activeProjectId: id });
    get().calculateScores();
  },

  deleteProject: (id) => {
    if (get().projects.length <= 1) return;
    
    const updatedProjects = get().projects.filter(p => p.id !== id);
    let nextActiveId = get().activeProjectId;
    
    if (get().activeProjectId === id) {
      nextActiveId = updatedProjects[0].id;
    }
    
    localStorage.setItem('urbanis-projects', JSON.stringify(updatedProjects));
    localStorage.setItem('urbanis-active-project-id', nextActiveId);
    
    set({
      projects: updatedProjects,
      activeProjectId: nextActiveId
    });
    
    get().calculateScores();
  },

  setActiveMapLayer: (layer) => {
    set({ activeMapLayer: layer });
  },

  toggleTheme: () => {
    const newTheme = get().theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('urbanis-theme', newTheme);
    set({ theme: newTheme });
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  },

  initTheme: () => {
    const theme = get().theme;
    document.documentElement.classList.toggle('dark', theme === 'dark');
  },

  calculateScores: () => {
    const { projects, activeProjectId } = get();
    const activeProject = projects.find(p => p.id === activeProjectId) || projects[0];
    if (!activeProject) return;

    const profileData = PROFILES[activeProject.profile || "pharmacy-popular"] || PROFILES["pharmacy-popular"];

    const { weights } = profileData;
    const { infra, market, risk, balance, alpha } = weights;

    const scoredDistricts = (rawData as DistrictData[]).map((d) => {
      // 1. Pilar de Infraestrutura
      const infraScore = d.dens_norm * infra.dens + d.mob_norm * infra.mob;

      // 2. Pilar de Potencial de Mercado
      const marketScore =
        d.central_norm * market.central +
        d.pop_norm * market.pop +
        d.idade_norm * market.idade;

      // 3. Cruzamento e Balanceamento de Oportunidades (MCDA - Multi-Criteria Decision Analysis)
      const opportunityScore =
        infraScore * balance.infra + marketScore * balance.market;

      // 4. Pilar de Risco Operacional Ponderado
      const riskScore = d.crime_norm * risk.crime + d.vulner_norm * risk.socio;

      // 5. Cálculo do Score de Aderência Territorial (WLC - Weighted Linear Combination com atenuação de Risco)
      let urbanScore = opportunityScore * (1 - alpha * riskScore);
      urbanScore = Math.max(0, Math.min(1, urbanScore)) * 100;

      return {
        ...d,
        InfraScore: infraScore,
        MarketScore: marketScore,
        OpportunityScore: opportunityScore,
        RiskScore: riskScore,
        UrbanScore: urbanScore,
      };
    });

    // Ordenação decrescente por Aderência Territorial (UrbanScore)
    scoredDistricts.sort((a, b) => (b.UrbanScore || 0) - (a.UrbanScore || 0));
    set({ districts: scoredDistricts });
  },
}));

// Initialize active projectId and scores
const initialProjects = useUrbanStore.getState().projects;
const initialActiveId = loadSavedActiveProjectId(initialProjects);
useUrbanStore.setState({ activeProjectId: initialActiveId });
useUrbanStore.getState().calculateScores();
useUrbanStore.getState().initTheme();
