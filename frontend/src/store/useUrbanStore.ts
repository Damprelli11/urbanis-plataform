import { create } from 'zustand';
import type { DistrictData, SegmentWeights } from '../types';
import rawData from '../data/urbanis_data.json';
import { SEGMENTS } from '../config/segments';

interface UrbanStore {
  selectedSegment: string;
  districts: DistrictData[];
  theme: 'dark' | 'light';
  activeMapLayer: 'score' | 'crime' | 'age' | 'mobility';
  setSegment: (segment: string) => void;
  setActiveMapLayer: (layer: 'score' | 'crime' | 'age' | 'mobility') => void;
  calculateScores: (segment: string) => void;
  toggleTheme: () => void;
  initTheme: () => void;
}

export const useUrbanStore = create<UrbanStore>((set, get) => ({
  selectedSegment: "Logística Last-Mile",
  districts: [],
  theme: (localStorage.getItem('urbanis-theme') as 'dark' | 'light') || 'dark',
  activeMapLayer: 'score',

  setSegment: (segment: string) => {
    set({ selectedSegment: segment });
    get().calculateScores(segment);
  },

  setActiveMapLayer: (layer: 'score' | 'crime' | 'age' | 'mobility') => {
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

  calculateScores: (segment: string) => {
    const weights: SegmentWeights = SEGMENTS[segment];
    if (!weights) return;

    const { infra, market, risk, balance, alpha } = weights;

    const scoredDistricts = (rawData as DistrictData[]).map((d) => {
      const infraScore = d.dens_norm * infra.dens + d.mob_norm * infra.mob;
      const marketScore =
        d.central_norm * market.central +
        d.pop_norm * market.pop +
        d.idade_norm * market.idade;
      const opportunityScore =
        infraScore * balance.infra + marketScore * balance.market;
      const riskScore = d.crime_norm * risk.crime + d.vulner_norm * risk.socio;

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

    scoredDistricts.sort((a, b) => (b.UrbanScore || 0) - (a.UrbanScore || 0));
    set({ districts: scoredDistricts });
  },
}));

// Initialize the store immediately
useUrbanStore.getState().calculateScores(useUrbanStore.getState().selectedSegment);
useUrbanStore.getState().initTheme();
