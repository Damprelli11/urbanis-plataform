import { useUrbanStore } from "@/store/useUrbanStore";
import { StrategicNarrative } from "@/components/dashboard/StrategicNarrative";
import { RankingChart } from "@/components/charts/RankingChart";
import { CompositionChart } from "@/components/charts/CompositionChart";
import { ChoroplethMap } from "@/components/dashboard/ChoroplethMap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { MapPin, Users, Activity, Target, ArrowUpRight, Printer, Info } from "lucide-react";
import { getUrbanScoreColor } from "@/lib/colors";

export function Dashboard() {
  const { districts, activeProjectId, projects, activeMapLayer, selectedDistrictName, setSelectedDistrictName } = useUrbanStore();

  if (!districts || districts.length === 0) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Iniciando Motor de Dados...</p>
        </div>
      </div>
    );
  }

  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0];

  const defaultTopDistrict = districts[0];
  const topDistrict = selectedDistrictName
    ? districts.find(d => d.nm_dist.toUpperCase() === selectedDistrictName.toUpperCase()) || defaultTopDistrict
    : defaultTopDistrict;
  const totalPop = districts.reduce((acc, d) => acc + (d.populacao || 0), 0);
  const avgDens = districts.reduce((acc, d) => acc + (d.dens_demog || 0), 0) / districts.length;

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* 💻 CONTEÚDO DO DASHBOARD (Escondido na Impressão) */}
      <div className="space-y-10 animate-in fade-in duration-500 print:hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 print:border-b print:pb-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 print:hidden">
            <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded border border-primary/20 uppercase tracking-wider">
              Análise Contextual Territorial
            </span>
          </div>
          <h1 className="text-3xl font-heading text-foreground tracking-tight leading-none uppercase font-black">
            {activeProject ? activeProject.name : "Estudo de Aderência"}
          </h1>
          {activeProject && (
            <div className="text-muted-foreground font-medium text-xs flex flex-wrap gap-x-4 gap-y-1.5 items-center pt-1">
              <span>Segmento: <b className="text-foreground uppercase">{activeProject.segment}</b></span>
              <span className="opacity-20">|</span>
              <span>Objetivo: <b className="text-foreground">{activeProject.strategicGoal}</b></span>
            </div>
          )}
        </div>

        <div className="flex gap-3 print:hidden">
          <button 
            onClick={handlePrint}
            className="h-10 px-4 bg-primary text-white text-xs font-bold uppercase tracking-widest rounded-md hover:brightness-110 transition-fast active:scale-95 flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Salvar Estudo (PDF)
          </button>
        </div>
      </div>

      {/* Strategic Box */}
      <div className="print:break-inside-avoid">
        <StrategicNarrative topDistrict={topDistrict} segment={activeProject?.segment || "Geral"} />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 print:grid-cols-4 print:gap-4 print:break-inside-avoid">
        <StatCard
          title="Distritos Analisados"
          value={districts.length.toString()}
          icon={MapPin}
          trend="+0.0%"
          trendLabel="Limite Geográfico"
        />
        <StatCard
          title="População Total"
          value={totalPop.toLocaleString('pt-BR')}
          icon={Users}
          trend="+2.1%"
          trendLabel="Cresc. Demográfico"
        />
        <StatCard
          title="Densidade Média"
          value={Math.round(avgDens).toLocaleString('pt-BR')}
          unit="hab/km²"
          icon={Activity}
          trend="-0.4%"
          trendLabel="Adensamento Urbano"
        />
        <StatCard
          title={selectedDistrictName ? `Aderência: ${topDistrict.nm_dist}` : "Top Aderência"}
          value={topDistrict.UrbanScore?.toFixed(1) || "0"}
          unit="%"
          icon={Target}
          trend="+1.2%"
          trendLabel={selectedDistrictName ? "Foco Selecionado" : "Evolução Comercial"}
          primary
        />
      </div>

      {/* Map & Top 10 Table */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 print:grid-cols-1 print:gap-4">
        <div className="lg:col-span-3 print:hidden">
          <Card className="h-full flex flex-col">
            <CardHeader className="border-b border-border bg-muted/20 py-4">
              <CardTitle className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">Distribuição Territorial de Aderência</CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 min-h-[500px]">
              <ChoroplethMap />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 print:break-inside-avoid">
          <Card className="h-full flex flex-col">
            <CardHeader className="border-b border-border bg-muted/20 py-4">
              <CardTitle className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">Top 10 Polos de Aderência</CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Distrito</th>
                    <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      {activeMapLayer === 'mobility' ? 'Fluxo/Dia' : activeMapLayer === 'crime' ? 'Ocorrências' : activeMapLayer === 'age' ? 'Idade Média' : 'Aderência'}
                    </th>
                    <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">
                      {activeMapLayer === 'mobility' ? 'Nº Estações' : activeMapLayer === 'crime' ? 'Nível de Risco' : activeMapLayer === 'age' ? 'Perfil' : 'Status'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {[...districts].sort((a, b) => {
                    if (activeMapLayer === 'mobility') return (b.n_mob || 0) - (a.n_mob || 0);
                    if (activeMapLayer === 'crime') return (b.n_crime || 0) - (a.n_crime || 0);
                    if (activeMapLayer === 'age') return (b.id_media || 0) - (a.id_media || 0);
                  }).slice(0, 10).map((d) => {
                    const isSelected = selectedDistrictName && d.nm_dist.toUpperCase() === selectedDistrictName.toUpperCase();
                    return (
                      <tr 
                        key={d.nm_dist} 
                        onClick={() => setSelectedDistrictName(d.nm_dist)}
                        className={`hover:bg-muted/30 transition-fast group cursor-pointer border-b border-border/40 ${
                          isSelected ? 'bg-primary/5 border-l-2 border-primary' : ''
                        }`}
                      >
                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-foreground group-hover:text-primary transition-fast">{d.nm_dist}</span>
                        </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm font-bold text-foreground">
                          {activeMapLayer === 'mobility'
                            ? (d.n_mob ? `${Math.round(Math.exp(d.n_mob) - 1)} mil` : '0')
                            : activeMapLayer === 'crime'
                              ? d.n_crime?.toLocaleString('pt-BR') || 0
                              : activeMapLayer === 'age'
                                ? `${d.id_media?.toFixed(1)} anos`
                                : `${d.UrbanScore?.toFixed(1)}%`
                          }
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {activeMapLayer === 'score' ? (
                          <span
                            className="text-[9px] font-bold px-2 py-1 rounded uppercase tracking-tighter"
                            style={{
                              backgroundColor: `${getUrbanScoreColor(d.UrbanScore || 0).replace('rgb', 'rgba').replace(')', ', 0.15)')}`,
                              color: getUrbanScoreColor(d.UrbanScore || 0),
                              border: `1px solid ${getUrbanScoreColor(d.UrbanScore || 0).replace('rgb', 'rgba').replace(')', ', 0.3)')}`
                            }}
                          >
                            {d.UrbanScore! >= 80 ? 'Ideal' :
                              d.UrbanScore! >= 70 ? 'Excelente' :
                                d.UrbanScore! >= 60 ? 'Muito Bom' :
                                  d.UrbanScore! >= 50 ? 'Bom' :
                                    d.UrbanScore! >= 40 ? 'Moderado' :
                                      d.UrbanScore! >= 30 ? 'Regular' :
                                        d.UrbanScore! >= 20 ? 'Atenção' : 'Crítico'}
                          </span>
                        ) : activeMapLayer === 'mobility' ? (
                          <span className="font-mono text-sm font-bold text-foreground">
                            {d.n_stations || 0}
                          </span>
                        ) : activeMapLayer === 'crime' ? (
                          <span className={`text-[9px] font-bold px-2 py-1 rounded uppercase tracking-tighter ${(d.n_crime || 0) > 800 ? 'bg-red-600/10 text-red-600 border border-red-600/20' :
                            (d.n_crime || 0) > 400 ? 'bg-red-400/10 text-red-400 border border-red-400/20' :
                              'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                            }`}>
                            {(d.n_crime || 0) > 800 ? 'Risco Crítico' : (d.n_crime || 0) > 400 ? 'Alto Risco' : 'Risco Moderado'}
                          </span>
                        ) : (
                          <span className={`text-[9px] font-bold px-2 py-1 rounded uppercase tracking-tighter ${(d.id_media || 0) >= 60 ? 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20' :
                            (d.id_media || 0) >= 30 ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                              'bg-cyan-500/10 text-cyan-500 border border-cyan-500/20'
                            }`}>
                            {(d.id_media || 0) >= 60 ? 'Sênior' : (d.id_media || 0) >= 30 ? 'Adulto' : 'Jovem'}
                          </span>
                        )}
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Chart Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:grid-cols-1 print:gap-4 print:break-inside-avoid">
        <Card className="lg:col-span-2">
          <CardHeader className="border-b border-border bg-muted/20 py-4">
            <CardTitle className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">Ranking de Aderência por Distrito</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 h-[500px] overflow-y-auto overflow-x-hidden custom-scrollbar">
            <div style={{ height: `${districts.length * 35}px` }}>
              <RankingChart limit={districts.length} />
            </div>
          </CardContent>
        </Card>

        <Card className="print:break-inside-avoid">
          <CardHeader className="border-b border-border bg-muted/20 py-4 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">Matriz de Ponderação Lógica</CardTitle>
            <div className="relative group/info">
              <Info className="w-3.5 h-3.5 text-muted-foreground cursor-pointer" />
              <div className="absolute right-0 bottom-6 hidden group-hover/info:block w-48 bg-background border border-border p-2.5 rounded shadow-lg text-[9px] leading-relaxed text-muted-foreground z-10">
                Ponderadores fixados com base no perfil operacional metodológico de segmento, impossibilitando arbitrariedade de sliders manuais.
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 h-[500px]">
            <CompositionChart />
          </CardContent>
        </Card>
      </div>
    </div>

    {/* 🖨️ SEÇÃO EXCLUSIVA PARA IMPRESSÃO (PDF) */}
      <div className="hidden print:block font-sans text-black bg-white p-8 max-w-4xl mx-auto space-y-8 leading-relaxed text-sm">
        
        {/* Capa / Cabeçalho do Relatório */}
        <div className="border-b-4 border-[#dc2626] pb-6 text-center space-y-2">
          <div className="text-[10px] font-mono tracking-[0.3em] text-muted-foreground uppercase">Plataforma de Inteligência Territorial & Apoio à Decisão</div>
          <h1 className="text-4xl font-heading text-black font-black uppercase tracking-tight">Relatório de Viabilidade Comercial</h1>
          <p className="text-xs font-mono text-muted-foreground uppercase">
            Estudo: <span className="font-bold text-black">{activeProject?.name || "Estudo de Aderência"}</span> | 
            Segmento: <span className="font-bold text-black">{activeProject?.segment || "Geral"}</span>
          </p>
          <div className="text-[10px] text-muted-foreground font-mono">
            Gerado em {new Date().toLocaleDateString('pt-BR')} | São Paulo - SP
          </div>
        </div>

        {/* Resumo Executivo */}
        <div className="bg-muted/10 p-6 rounded-lg border border-border/80 space-y-3">
          <h2 className="text-base font-bold uppercase tracking-wider text-black font-heading">1. Resumo Executivo</h2>
          <p className="text-xs">
            Este relatório apresenta a análise de viabilidade e aderência territorial para o projeto <b>{activeProject?.name || "Estudo"}</b>, cujo objetivo estratégico é: <i>"{activeProject?.strategicGoal || "Identificar o melhor polo comercial"}"</i>.
          </p>
          <p className="text-xs">
            Utilizando a metodologia de decisão de inteligência territorial, o sistema cruzou bases públicas históricas consolidadas (Censo IBGE, Fundação SEADE, Secretaria de Segurança Pública - SSP, IPVS e dados de estações metroferroviárias) para mapear a atratividade comercial dos distritos do município de São Paulo.
          </p>
        </div>

        {/* Diagnóstico do Distrito Selecionado/Líder */}
        <div className="space-y-4">
          <h2 className="text-base font-bold uppercase tracking-wider text-black font-heading border-b border-border pb-2">
            2. Análise do Polo Recomendado: {topDistrict.nm_dist}
          </h2>
          <p className="text-xs">
            O distrito de <b>{topDistrict.nm_dist}</b> foi classificado no topo do ranking analítico de tomada de decisão, obtendo o maior <b>UrbanScore</b> consolidado de <b>{topDistrict.UrbanScore?.toFixed(1)}%</b> de aderência operacional para o segmento <b>{activeProject?.segment}</b>. Abaixo, detalha-se o diagnóstico dos eixos de decisão:
          </p>

          <div className="grid grid-cols-1 gap-6 mt-4">
            
            {/* Eixo Demográfico */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold uppercase tracking-wide text-black">A. Eixo Demográfico e Densidade Populacional</h3>
              <p className="text-xs">
                O distrito possui uma população total de <b>{topDistrict.populacao?.toLocaleString('pt-BR')} habitantes</b>, com uma densidade demográfica expressiva de <b>{Math.round(topDistrict.dens_demog || 0).toLocaleString('pt-BR')} hab/km²</b> (índice normalizado de {Math.round(topDistrict.dens_norm * 100)}%). A idade média da população é de <b>{topDistrict.id_media?.toFixed(1)} anos</b>. 
                Estes dados confirmam um mercado consumidor de alta densidade local, ideal para negócios com foco em ganho de escala e alto tráfego de clientes residenciais locais.
              </p>
            </div>

            {/* Eixo de Acessibilidade e Mobilidade */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold uppercase tracking-wide text-black">B. Infraestrutura de Acessibilidade e Fluxo Urbano</h3>
              <p className="text-xs">
                O distrito conta com <b>{topDistrict.n_stations || 0} estação(ões) metroferroviária(s)</b> ativa(s) em seu território geográfico. 
                {topDistrict.n_stations > 0 ? (
                  <span> O fluxo diário nas plataformas de embarque e desembarque atinge cerca de <b>{Math.round(Math.exp(topDistrict.n_mob) - 1)} mil passageiros/dia</b>. Essa infraestrutura de alta capacidade garante excelente acessibilidade interdistrital, alta captação de clientes flutuantes (trabalhadores e estudantes em trânsito) e forte atratividade para operações de comércio de passagem rápida.</span>
                ) : (
                  <span> O distrito não possui conexões diretas de transporte sobre trilhos de alta capacidade. O tráfego local é majoritariamente residencial e dependente de linhas secundárias de ônibus ou deslocamento privado, o que o qualifica preferencialmente como um mercado de vizinhança residencial estrita, sem dependência de fluxo flutuante externo.</span>
                )}
              </p>
            </div>

            {/* Eixo de Segurança e Vulnerabilidade */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold uppercase tracking-wide text-black">C. Eixo de Segurança Pública e Vulnerabilidade Social</h3>
              <p className="text-xs">
                Em relação à segurança pública, o distrito registrou um volume de <b>{topDistrict.n_crime || 0} ocorrências</b> criminais anuais agregadas pela Secretaria de Segurança Pública. 
                O Índice Paulista de Vulnerabilidade Social (IPVS) do distrito é de <b>{topDistrict.socio_vulnerability_score?.toFixed(2)}</b> (escala normalizada de {Math.round(topDistrict.vulner_norm * 100)}%, onde menor vulnerabilidade indica maior poder aquisitivo médio).
                {topDistrict.n_crime > 500 ? (
                  <span> <b className="text-[#dc2626]">Alerta de Risco Operacional:</b> O elevado número de ocorrências na região requer que o plano de implantação contemple investimentos adicionais em segurança física ativa, controle eletrônico de acessos e seguro patrimonial robusto para mitigar perdas operacionais locais.</span>
                ) : (
                  <span> A segurança do distrito está em níveis controlados e favoráveis para implantação de vitrines abertas e atendimento ao público estendido, reduzindo sensivelmente os custos preventivos de perdas patrimoniais.</span>
                )}
              </p>
            </div>

          </div>
        </div>

        {/* Parecer Estratégico do Analista */}
        <div className="space-y-4 pt-4 border-t border-border">
          <h2 className="text-base font-bold uppercase tracking-wider text-black font-heading">
            3. Parecer Técnico & Recomendações
          </h2>
          <p className="text-xs">
            Com base nas variáveis ambientais e territoriais processadas, emitimos as seguintes diretrizes para o projeto <b>{activeProject?.name}</b> em <b>{topDistrict.nm_dist}</b>:
          </p>
          <ul className="list-disc pl-5 text-xs space-y-2">
            <li>
              <b>Aproveitamento de Centralidade</b>: O distrito apresenta um índice de centralidade de {topDistrict.central_norm?.toFixed(2)}, indicando uma região com {topDistrict.central_norm > 0.6 ? "altíssima maturidade comercial consolidada, com forte concorrência local, mas altíssimo potencial de conversão de leads" : "desenvolvimento comercial em consolidação, oferecendo menor custo de ocupação territorial e potencial pioneiro de captação de mercado"}.
            </li>
            <li>
              <b>Perfil Demográfico do Negócio</b>: A idade média local ({topDistrict.id_media?.toFixed(1)} anos) sugere que as estratégias de comunicação visual, canais de marketing e mix de produtos/serviços devem ser desenhadas para atender ao perfil de público <b>{topDistrict.id_media >= 42 ? "Adulto-Sênior, valorizando acessibilidade física, atendimento de alta qualidade e conveniência" : "Jovem-Adulto, com forte apelo em canais digitais, agilidade no atendimento e flexibilidade operacional"}</b>.
            </li>
            <li>
              <b>Decisão de Implantação</b>: O distrito de <b>{topDistrict.nm_dist}</b> qualifica-se como {
                topDistrict.UrbanScore! >= 70 ? (
                  <strong className="text-emerald-600 uppercase font-black">Recomendado (Sinal Verde)</strong>
                ) : topDistrict.UrbanScore! >= 45 ? (
                  <strong className="text-amber-500 uppercase font-black">Recomendado com Ressalvas (Sinal Amarelo)</strong>
                ) : (
                  <strong className="text-red-600 uppercase font-black">Não Recomendado (Sinal Vermelho)</strong>
                )
              } para prosseguimento dos estudos de viabilidade comercial e negociação de pontos físicos, dada a aderência de <b>{topDistrict.UrbanScore?.toFixed(1)}%</b> obtida em nossa análise determinística.
            </li>
          </ul>
        </div>

        {/* Rodapé / Assinatura Acadêmica */}
        <div className="pt-12 flex items-center justify-between border-t border-border mt-12 text-[9px] font-mono text-muted-foreground">
          <span>DOCUMENTO OFICIAL GERADO PELA PLATAFORMA URBANIS</span>
          <span>SÃO PAULO, BRASIL</span>
        </div>

      </div>
    </>
  );
}

function StatCard({ title, value, unit, icon: Icon, trend, trendLabel, primary }: any) {
  return (
    <Card className={`relative overflow-hidden transition-fast group hover:border-primary/50 ${primary ? 'border-primary/30 bg-primary/5' : ''}`}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4 print:mb-2">
          <div className={`p-2 rounded ${primary ? 'bg-primary text-white' : 'bg-muted text-muted-foreground group-hover:text-primary transition-fast'}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div className="flex flex-col items-end print:hidden">
            <div className={`flex items-center gap-0.5 text-[10px] font-bold font-mono ${trend.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>
              <ArrowUpRight className={`w-3 h-3 ${trend.startsWith('+') ? '' : 'rotate-90'}`} />
              {trend}
            </div>
            {trendLabel && (
              <span className="text-[8px] font-mono text-muted-foreground uppercase tracking-wide opacity-80 mt-0.5 select-none">
                {trendLabel}
              </span>
            )}
          </div>
        </div>
        <div>
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-1">{title}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-mono font-bold tracking-tighter">{value}</span>
            {unit && <span className="text-xs text-muted-foreground font-medium">{unit}</span>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
