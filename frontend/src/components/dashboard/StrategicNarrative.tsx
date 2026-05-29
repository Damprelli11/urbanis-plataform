import type { DistrictData } from "@/types";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

interface StrategicNarrativeProps {
  topDistrict: DistrictData;
  segment: string;
}

export function StrategicNarrative({ topDistrict, segment }: StrategicNarrativeProps) {
  const score = topDistrict.UrbanScore || 0;
  
  let boxColor, statusLabel, Icon, boxBgClass;
  
  if (score >= 70) {
    boxColor = "text-[#16a34a]"; // Verde Escuro
    boxBgClass = "bg-[#16a34a]/5";
    statusLabel = "ADERÊNCIA EXCELENTE";
    Icon = CheckCircle2;
  } else if (score >= 55) {
    boxColor = "text-[#22c55e]"; // Verde Claro
    boxBgClass = "bg-[#22c55e]/5";
    statusLabel = "ALTA ADERÊNCIA";
    Icon = CheckCircle2;
  } else if (score >= 40) {
    boxColor = "text-[#a3e635]"; // Verde Limão
    boxBgClass = "bg-[#a3e635]/5";
    statusLabel = "ADERÊNCIA SATISFATÓRIA (BOM)";
    Icon = CheckCircle2;
  } else if (score >= 25) {
    boxColor = "text-[#eab308]"; // Amarelo
    boxBgClass = "bg-[#eab308]/5";
    statusLabel = "ADERÊNCIA REGULAR / MODERADA";
    Icon = AlertTriangle;
  } else {
    boxColor = "text-[#ef4444]"; // Vermelho
    boxBgClass = "bg-[#ef4444]/5";
    statusLabel = "BAIXA ADERÊNCIA / ALTO RISCO";
    Icon = XCircle;
  }

  const cDesc = topDistrict.central_norm > 0.7 ? "Alta Centralidade Econômica" : topDistrict.central_norm > 0.3 ? "Centralidade em Consolidação" : "Baixa Influência Econômica";
  const mDesc = topDistrict.mob_norm > 0.6 ? "Elevado Fluxo Urbano" : "Fluxo Urbano Localizado";
  const rDesc = (topDistrict.RiskScore || 0) < 0.4 ? "Risco Operacional Controlado" : "⚠️ Alerta de Risco Estrutural";
  const dDesc = topDistrict.dens_norm > 0.6 
    ? "Altíssima Densidade Residencial" 
    : topDistrict.dens_norm > 0.3 
      ? "Média Densidade Residencial" 
      : "Baixa Densidade Residencial";

  return (
    <div 
      className={`p-10 rounded-xl border border-border flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10 transition-fast ${boxBgClass}`}
      style={{ borderLeftWidth: '8px', borderLeftColor: 'currentColor' }}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-4">
          <Icon className={`w-5 h-5 ${boxColor}`} />
          <span className={`text-[10px] font-mono font-bold uppercase tracking-widest ${boxColor}`}>
            {statusLabel}
          </span>
        </div>
        
        <h2 className="text-5xl md:text-6xl font-heading text-foreground tracking-tighter uppercase leading-none mb-4">
          {topDistrict.nm_dist}
        </h2>
        
        <div className="flex items-center gap-4 mb-8">
          <div className="h-px bg-border flex-1"></div>
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.3em]">Auditoria de Performance</span>
          <div className="h-px bg-border flex-1"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
          <NarrativeItem label="Eixo Econômico" value={cDesc} />
          <NarrativeItem label="Índice de Mobilidade" value={mDesc} />
          <NarrativeItem label="Perfil de Segurança" value={rDesc} warning={(topDistrict.RiskScore || 0) >= 0.4} />
          <NarrativeItem label="Demografia" value={dDesc} />
        </div>
      </div>

      <div className="min-w-[240px] bg-background p-8 rounded-lg border border-border text-center flex flex-col items-center shadow-sm">
        <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest mb-2">
          UrbanScore
        </span>
        <div className={`text-7xl font-mono font-bold tracking-tighter mb-2 ${boxColor}`}>
          {score.toFixed(1)}
        </div>
        <div className="px-3 py-1 rounded bg-muted border border-border text-[9px] font-bold text-muted-foreground tracking-widest uppercase">
          ESTRATÉGIA: {segment}
        </div>
      </div>
    </div>
  );
}

function NarrativeItem({ label, value, warning }: { label: string, value: string, warning?: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <div className={`mt-1 h-1.5 w-1.5 rounded-full shrink-0 ${warning ? 'bg-red-500' : 'bg-primary'}`}></div>
      <div>
        <p className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider mb-0.5">{label}</p>
        <p className={`text-sm font-medium ${warning ? 'text-red-500' : 'text-foreground'}`}>{value}</p>
      </div>
    </div>
  );
}
