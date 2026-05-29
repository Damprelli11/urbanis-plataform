import { useState, useRef, useEffect } from "react";
import { useUrbanStore } from "@/store/useUrbanStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ChevronRight, ArrowLeftRight, Download, TrainFront, Search, ChevronDown } from "lucide-react";
import { getUrbanScoreColor } from "@/lib/colors";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

interface DistrictData {
  nm_dist: string;
  [key: string]: any;
}

function SearchableSelect({ value, onChange, options, label, color, textRight = false }: {
  value: string;
  onChange: (val: string) => void;
  options: DistrictData[];
  label: string;
  color: string;
  textRight?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const sortedOptions = [...options].sort((a, b) => a.nm_dist.localeCompare(b.nm_dist));

  const filteredOptions = sortedOptions.filter(d => 
    d.nm_dist.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full text-left" ref={dropdownRef}>
      <label className={`text-[10px] font-mono font-bold uppercase tracking-[0.2em] mb-3 block px-1 ${textRight ? "text-right" : "text-left"}`} style={{ color }}>
        {label}
      </label>
      
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          setSearch("");
        }}
        className="w-full h-14 px-4 bg-background border rounded-lg text-lg font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-fast flex items-center justify-between shadow-sm cursor-pointer"
        style={{ 
          borderColor: `${color}4D`,
          textAlign: textRight ? 'right' : 'left',
          flexDirection: textRight ? 'row-reverse' : 'row'
        }}
      >
        <span>{value}</span>
        <ChevronDown className="w-5 h-5 opacity-60 transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }} />
      </button>

      {isOpen && (
        <div 
          className="absolute z-50 mt-2 w-full bg-card border border-border/80 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
        >
          <div className="p-3 border-b border-border/60 bg-muted/20 flex items-center gap-2">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Digite para filtrar..."
              className="w-full bg-transparent border-none text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-0"
              autoFocus
            />
          </div>

          <ul className="max-h-60 overflow-y-auto py-1 divide-y divide-border/20">
            {filteredOptions.length > 0 ? (
              filteredOptions.map(d => {
                const isSelected = d.nm_dist === value;
                return (
                  <li key={d.nm_dist}>
                    <button
                      type="button"
                      onClick={() => {
                        onChange(d.nm_dist);
                        setIsOpen(false);
                      }}
                      className={`w-full px-4 py-3 text-left text-sm font-semibold transition-fast flex items-center justify-between hover:bg-primary/5 ${
                        isSelected ? 'bg-primary/10 text-primary font-bold' : 'text-foreground'
                      }`}
                      style={{
                        flexDirection: textRight ? 'row-reverse' : 'row'
                      }}
                    >
                      <span>{d.nm_dist}</span>
                      {isSelected && (
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      )}
                    </button>
                  </li>
                );
              })
            ) : (
              <li className="px-4 py-4 text-xs font-semibold text-muted-foreground text-center">
                Nenhum distrito encontrado
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export function Compare() {
  const { districts, activeProjectId, projects } = useUrbanStore();
  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0];
  
  const sortedDistricts = [...districts].sort((a, b) => a.nm_dist.localeCompare(b.nm_dist));
  
  const [distA, setDistA] = useState<string>(() => sortedDistricts[0]?.nm_dist || "");
  const [distB, setDistB] = useState<string>(() => sortedDistricts[1]?.nm_dist || "");

  if (!districts.length) return null;

  const dataA = districts.find(d => d.nm_dist === distA) || districts[0];
  const dataB = districts.find(d => d.nm_dist === distB) || districts[1];

  const keyA = `${dataA.nm_dist} (PRINCIPAL)`;
  const keyB = `${dataB.nm_dist} (SECUNDÁRIO)`;

  const comparisonData = [
    {
      metric: "OPORTUNIDADE",
      [keyA]: Number(((dataA.OpportunityScore || 0) * 100).toFixed(1)),
      [keyB]: Number(((dataB.OpportunityScore || 0) * 100).toFixed(1)),
    },
    {
      metric: "INFRAESTRUTURA",
      [keyA]: Number(((dataA.InfraScore || 0) * 100).toFixed(1)),
      [keyB]: Number(((dataB.InfraScore || 0) * 100).toFixed(1)),
    },
    {
      metric: "POTENCIAL MERCADO",
      [keyA]: Number(((dataA.MarketScore || 0) * 100).toFixed(1)),
      [keyB]: Number(((dataB.MarketScore || 0) * 100).toFixed(1)),
    },
    {
      metric: "PERFIL DE RISCO",
      [keyA]: Number(((dataA.RiskScore || 0) * 100).toFixed(1)),
      [keyB]: Number(((dataB.RiskScore || 0) * 100).toFixed(1)),
    },
    {
      metric: "URBANSCORE",
      [keyA]: Number((dataA.UrbanScore || 0).toFixed(1)),
      [keyB]: Number((dataB.UrbanScore || 0).toFixed(1)),
    }
  ];

  const downloadAuditData = () => {
    const exportData = {
      projeto: {
        nome: activeProject?.name || "Estudo de Viabilidade",
        segmento: activeProject?.segment || "Geral",
        objetivo_estrategico: activeProject?.strategicGoal || ""
      },
      data_auditoria: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR'),
      comparacao: {
        distrito_principal: {
          nome: dataA.nm_dist,
          score_geral_urbanis: dataA.UrbanScore,
          eixos: {
            capacidade_infraestrutura: Number(((dataA.InfraScore || 0) * 100).toFixed(1)),
            densidade_mercado: Number(((dataA.MarketScore || 0) * 100).toFixed(1)),
            mitigacao_risco: Number(((1 - (dataA.RiskScore || 0)) * 100).toFixed(1))
          },
          indicadores: {
            populacao_total: dataA.populacao,
            densidade_demografica_hab_km2: dataA.dens_demog,
            idade_media_anos: dataA.id_media,
            estacoes_metroferroviarias: dataA.n_stations,
            fluxo_passageiros_dia: dataA.n_mob ? Math.round(Math.exp(dataA.n_mob) - 1) * 1000 : 0,
            ocorrencias_criminais_anuais: dataA.n_crime,
            indice_vulnerabilidade_social: dataA.socio_vulnerability_score
          }
        },
        distrito_secundario: {
          nome: dataB.nm_dist,
          score_geral_urbanis: dataB.UrbanScore,
          eixos: {
            capacidade_infraestrutura: Number(((dataB.InfraScore || 0) * 100).toFixed(1)),
            densidade_mercado: Number(((dataB.MarketScore || 0) * 100).toFixed(1)),
            mitigacao_risco: Number(((1 - (dataB.RiskScore || 0)) * 100).toFixed(1))
          },
          indicadores: {
            populacao_total: dataB.populacao,
            densidade_demografica_hab_km2: dataB.dens_demog,
            idade_media_anos: dataB.id_media,
            estacoes_metroferroviarias: dataB.n_stations,
            fluxo_passageiros_dia: dataB.n_mob ? Math.round(Math.exp(dataB.n_mob) - 1) * 1000 : 0,
            ocorrencias_criminais_anuais: dataB.n_crime,
            indice_vulnerabilidade_social: dataB.socio_vulnerability_score
          }
        }
      }
    };

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(exportData, null, 2)
    )}`;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute(
      "download",
      `auditoria_${dataA.nm_dist.toLowerCase()}_vs_${dataB.nm_dist.toLowerCase()}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3 text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">
            <span className="text-primary">ANÁLISE</span>
            <ChevronRight className="w-3 h-3" />
            <span>AUDITORIA CRUZADA</span>
          </div>
          <h1 className="text-4xl font-heading text-foreground tracking-tight leading-none uppercase">Comparação Territorial</h1>
          <p className="text-muted-foreground mt-3 max-w-xl font-medium">
            Auditoria de performance lado a lado para o segmento <b className="text-foreground uppercase">{activeProject?.segment}</b>.
          </p>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={downloadAuditData}
            className="h-10 px-4 border border-border text-muted-foreground hover:text-foreground hover:border-primary/80 text-xs font-bold uppercase tracking-widest rounded-md hover:bg-primary/5 transition-fast flex items-center gap-2"
          >
            <Download className="w-3.5 h-3.5 text-primary" />
            Dados da Auditoria
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-end">
        <div className="lg:col-span-2">
          <SearchableSelect
            value={distA}
            onChange={setDistA}
            options={districts}
            label="Distrito Principal"
            color="#C0192B"
          />
        </div>
        
        <div className="flex justify-center pb-1">
          <div className="h-12 w-12 rounded-full border border-border bg-card flex items-center justify-center text-muted-foreground shadow-sm">
            <ArrowLeftRight className="w-5 h-5" />
          </div>
        </div>

        <div className="lg:col-span-2">
          <SearchableSelect
            value={distB}
            onChange={setDistB}
            options={districts}
            label="Distrito Secundário"
            color="#4F46E5"
            textRight={true}
          />
        </div>
      </div>

      <Card className="min-h-[600px]">
        <CardHeader className="border-b border-border bg-muted/20 py-6 px-8">
          <CardTitle className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">Matriz de Performance Comparativa</CardTitle>
        </CardHeader>
        <CardContent className="p-8 h-[500px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={comparisonData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              barGap={12}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border" opacity={0.5} />
              <XAxis 
                dataKey="metric" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: "currentColor", fontSize: 10, fontWeight: 700, fontFamily: "DM Mono" }}
                className="text-muted-foreground"
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: "currentColor", fontSize: 10, fontFamily: "DM Mono" }}
                className="text-muted-foreground"
              />
              <Tooltip 
                cursor={{ fill: "currentColor", opacity: 0.05 }}
                contentStyle={{ 
                  backgroundColor: "hsl(var(--card))", 
                  border: "1px solid hsl(var(--border))", 
                  borderRadius: "8px",
                  fontSize: "11px",
                  fontFamily: "DM Mono",
                  boxShadow: "none"
                }}
              />
              <Legend 
                verticalAlign="top" 
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingTop: "0px", paddingBottom: "20px" }}
                formatter={(value) => <span className="text-[10px] font-bold text-muted-foreground font-mono">{value}</span>}
              />
              {/* Fixed colors for the bar chart comparison as requested */}
              <Bar dataKey={keyA} radius={[2, 2, 0, 0]} barSize={40} fill="#C0192B" />
              <Bar dataKey={keyB} radius={[2, 2, 0, 0]} barSize={40} fill="#4F46E5" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AuditSummary data={dataA} type="Principal" color="#C0192B" />
        <AuditSummary data={dataB} type="Secundário" color="#4F46E5" />
      </div>
    </div>
  );
}

function AuditSummary({ data, type, color }: any) {
  const scoreColor = getUrbanScoreColor(data.UrbanScore || 0);
  
  return (
    <div className="p-8 bg-card border border-border rounded-xl transition-fast shadow-sm" style={{ borderTop: `4px solid ${color}` }}>
      <div className="flex justify-between items-start mb-6">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">Auditoria {type}</span>
          <h3 className="text-2xl font-heading text-foreground mt-1 tracking-tight">{data.nm_dist}</h3>
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5">
              <TrainFront className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-[10px] font-mono font-bold text-foreground">{data.n_stations || 0} ESTAÇÕES</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[10px] font-mono font-bold text-foreground">FLUXO: {data.n_mob ? (Math.exp(data.n_mob) - 1).toLocaleString('pt-BR', { maximumFractionDigits: 0 }) : '0'} /dia</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase block mb-1">Score Final</span>
          <span className="text-3xl font-mono font-bold" style={{ color: scoreColor }}>{data.UrbanScore?.toFixed(1)}</span>
        </div>
      </div>
      
      <div className="space-y-4">
        <AuditLine label="Capacidade Infra" value={data.InfraScore} />
        <AuditLine label="Densidade Mercado" value={data.MarketScore} />
        <AuditLine label="Mitigação de Risco" value={1 - data.RiskScore} />
      </div>
    </div>
  );
}

function AuditLine({ label, value }: any) {
  const percent = value * 100;
  const semanticColor = getUrbanScoreColor(percent);

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-[9px] font-mono font-bold uppercase tracking-widest text-muted-foreground">
        <span>{label}</span>
        <span style={{ color: semanticColor }}>{percent.toFixed(1)}%</span>
      </div>
      <div className="h-1 w-full bg-muted/40 rounded-full overflow-hidden">
        <div 
          className="h-full transition-fast" 
          style={{ width: `${percent}%`, backgroundColor: semanticColor }}
        ></div>
      </div>
    </div>
  );
}
