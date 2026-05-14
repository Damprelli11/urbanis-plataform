import { useState } from "react";
import { useUrbanStore } from "@/store/useUrbanStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ChevronRight, ArrowLeftRight, Download } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export function Compare() {
  const { districts, selectedSegment } = useUrbanStore();
  
  const [distA, setDistA] = useState<string>(districts[0]?.nm_dist || "");
  const [distB, setDistB] = useState<string>(districts[1]?.nm_dist || "");

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
            Auditoria de performance lado a lado para a estratégia <b className="text-foreground">{selectedSegment.toUpperCase()}</b>.
          </p>
        </div>
        
        <div className="flex gap-3">
          <button className="h-10 px-4 border border-border text-muted-foreground text-xs font-bold uppercase tracking-widest rounded-md hover:bg-white/5 transition-fast flex items-center gap-2">
            <Download className="w-3.5 h-3.5" />
            Dados da Auditoria
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-center">
        <div className="lg:col-span-2">
          <label className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-primary mb-3 block px-1">Distrito Principal</label>
          <select 
            value={distA} 
            onChange={e => setDistA(e.target.value)}
            className="w-full h-14 px-4 bg-[#16181B] border border-border rounded-lg text-lg font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-fast cursor-pointer appearance-none"
          >
            {districts.map(d => <option key={`A-${d.nm_dist}`} value={d.nm_dist}>{d.nm_dist}</option>)}
          </select>
        </div>
        
        <div className="flex justify-center pt-6">
          <div className="h-12 w-12 rounded-full border border-border bg-[#16181B] flex items-center justify-center text-muted-foreground">
            <ArrowLeftRight className="w-5 h-5" />
          </div>
        </div>

        <div className="lg:col-span-2">
          <label className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-muted-foreground mb-3 block px-1 text-right">Distrito Secundário</label>
          <select 
            value={distB} 
            onChange={e => setDistB(e.target.value)}
            className="w-full h-14 px-4 bg-[#16181B] border border-border rounded-lg text-lg font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-border transition-fast cursor-pointer appearance-none text-right"
          >
            {districts.map(d => <option key={`B-${d.nm_dist}`} value={d.nm_dist}>{d.nm_dist}</option>)}
          </select>
        </div>
      </div>

      <Card className="min-h-[600px]">
        <CardHeader className="border-b border-border bg-[#101113]/20 py-6 px-8">
          <CardTitle className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">Matriz de Performance Comparativa</CardTitle>
        </CardHeader>
        <CardContent className="p-8 h-[500px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={comparisonData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              barGap={12}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis 
                dataKey="metric" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700, fontFamily: "DM Mono" }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 10, fontFamily: "DM Mono" }}
              />
              <Tooltip 
                cursor={{ fill: "rgba(255,255,255,0.03)" }}
                contentStyle={{ 
                  backgroundColor: "#16181B", 
                  border: "1px solid rgba(255,255,255,0.1)", 
                  borderRadius: "8px",
                  fontSize: "11px",
                  fontFamily: "DM Mono",
                  boxShadow: "none"
                }}
              />
              <Legend 
                verticalAlign="top" 
                align="right"
                iconType="square"
                wrapperStyle={{ paddingTop: "0px", paddingBottom: "20px" }}
                formatter={(value) => <span className="text-[10px] font-bold text-muted-foreground font-mono">{value}</span>}
              />
              <Bar dataKey={keyA} fill="#C0192B" radius={[2, 2, 0, 0]} barSize={40} />
              <Bar dataKey={keyB} fill="#334155" radius={[2, 2, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AuditSummary data={dataA} type="Principal" color="text-primary" />
        <AuditSummary data={dataB} type="Secundário" color="text-slate-400" />
      </div>
    </div>
  );
}

function AuditSummary({ data, type, color }: any) {
  return (
    <div className="p-8 bg-[#16181B] border border-border rounded-xl">
      <div className="flex justify-between items-start mb-6">
        <div>
          <span className={`text-[10px] font-mono font-bold uppercase tracking-widest ${color}`}>Auditoria {type}</span>
          <h3 className="text-2xl font-heading text-foreground mt-1 tracking-tight">{data.nm_dist}</h3>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase block mb-1">Score Final</span>
          <span className={`text-3xl font-mono font-bold ${color}`}>{data.UrbanScore?.toFixed(1)}</span>
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
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-[9px] font-mono font-bold uppercase tracking-widest text-muted-foreground">
        <span>{label}</span>
        <span>{(value * 100).toFixed(1)}%</span>
      </div>
      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
        <div className="h-full bg-primary transition-fast" style={{ width: `${value * 100}%` }}></div>
      </div>
    </div>
  );
}
