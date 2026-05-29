# Fundação Escola de Comércio Álvares Penteado

# 🚀 Urbanis - Plataforma de Inteligência Territorial

## 🌆 Plataforma de Apoio à Decisão Espacial e Análise Territorial

Projeto desenvolvido no Projeto Interdisciplinar (PI) do curso de Análise e Desenvolvimento de Sistemas – 4º semestre.

A **Urbanis** é uma plataforma digital proprietária desenvolvida para suportar serviços de **consultoria estratégica em inteligência territorial**. A ferramenta é utilizada internamente por analistas para realizar diagnósticos espaciais aprofundados de bairros, cidades e distritos.  
A solução cruza bases públicas oficiais consolidadas, análises estatísticas espaciais, dashboards dinâmicos e modelagem multicritério para apoiar a tomada de decisão estratégica sobre localização, expansão comercial, riscos estruturais e potencial socioeconômico.

---

## 👥 Equipe

| Nome | Perfil |
|---|---|
| Pedro Augusto da Silva Macedo | [LinkedIn](https://www.linkedin.com/in/pedro-augusto-da-silva-macedo-9a0200187/) |
| Cassio Gonçalves Gama | [LinkedIn](https://www.linkedin.com/in/cassio-gama/) |
| Henrique Jorge Martins Figueiredo | [LinkedIn](https://www.linkedin.com/in/henrique-jorge-2b977726b/) |
| Renan Damprelli Cardoso da Silva | [LinkedIn](https://www.linkedin.com/in/renan-damprelli/) |
| Luiz Eduardo Souza Rocha | [LinkedIn](https://www.linkedin.com/in/luiz-eduardo-souza-rocha-09aab2321/) |


## 📝 Descrição do Projeto

A **Urbanis** é uma plataforma analítica responsiva voltada para a inteligência territorial e suporte a decisões espaciais.  
O sistema integra e processa dados geoespaciais e estatísticos de fontes oficiais, permitindo a visualização interativa de dinâmicas urbanas por meio de mapas choropléticos, gráficos de composição, rankings de atratividade e pareceres diagnósticos automatizados.

A plataforma baseia-se na metodologia de **Apoio à Decisão Multicritério (MCDA)** com ponderação linear aditiva (**WLC - Weighted Linear Combination**), avaliando três eixos principais:

- **Eixo Demográfico e de Mercado (MarketScore):** avalia a densidade populacional, população local e perfil etário para dimensionamento de mercado consumidor.
- **Eixo de Acessibilidade e Mobilidade (InfraScore):** metrifica a infraestrutura urbana com base na presença de estações metroferroviárias e fluxo diário estimado de passageiros.
- **Eixo de Segurança e Vulnerabilidade (RiskScore):** mapeia índices de criminalidade anual da Secretaria de Segurança Pública e vulnerabilidade socioeconômica baseada no Índice Paulista de Vulnerabilidade Social (IPVS).
- **UrbanScore:** índice de atratividade territorial consolidado (0 a 100%) que fundamenta de forma determinística a decisão técnica de implantação.

Com isso, o projeto busca otimizar a inteligência e o tempo de resposta em estudos de viabilidade comercial realizados para clientes de consultoria de forma ágil e segura.

---

## 🎯 Objetivos

- Criar uma plataforma Web analítica para suporte a serviços de consultoria em inteligência territorial.
- Utilizar bases públicas oficiais e consolidadas para fundamentar tomadas de decisão espacial de alta confiabilidade.
- Desenvolver dashboards dinâmicos com mapas choropléticos de alta resolução e gráficos estatísticos.
- Aplicar modelagem multicritério baseada em pesos dinâmicos ajustáveis pelo consultor de acordo com o segmento de negócio do cliente.
- Apoiar decisões estratégicas de expansão comercial, escolha de localização e mitigação de riscos operacionais.
- Gerar pareceres analíticos automatizados e relatórios executivos de auditoria otimizados para exportação/impressão em PDF.
- Disponibilizar recursos digitais para download de dados estruturados in JSON para auditorias externas.
- Garantir segurança no armazenamento de dados, autenticação de consultores e resiliência com modo de simulação offline.

---

## ⚙️ Funcionalidades

### 👤 Gestão de Estudos e Projetos

- Cadastro e autenticação segura de consultores na plataforma.
- Criação e gerenciamento de projetos de consultoria com parametrização dinâmica de pesos por segmento.
- Modo de demonstração offline para cenários de apresentações presenciais sem conectividade.
- Foco dinâmico em distritos através do clique no mapa ou na lista geral de dados.
- Geração de diagnósticos técnicos automatizados por eixo e parecer final de recomendação.
- Exportação automatizada de relatórios em formato PDF (impressão otimizada sem ruídos visuais).
- Download e exportação em formato digital (JSON) das métricas de auditoria comparada.

### 📊 Dashboards e Mapas Choropléticos

- Visualização interativa através de mapa choroplético integrado ao banco de dados geoespacial.
- Destaque visual com borda iluminada de alta visibilidade e isolamento do distrito em foco.
- Listagem dinâmica e ordenada dos 10 melhores distritos sob a ótica da camada selecionada.
- Matriz de performance comparativa lado a lado (auditoria cruzada) com gráficos dinâmicos de barras.

### 🧠 Modelagem Multicritério

- **InfraScore:** calcula o índice de acessibilidade pesando transporte sobre trilhos de alta capacidade e fluxo flutuante diário.
- **MarketScore:** calcula o índice de potencial de mercado pesando densidade habitacional e população absoluta.
- **RiskScore:** avalia o índice de mitigação de risco com base em vulnerabilidade socioeconômica e ocorrências criminais.
- **UrbanScore:** algoritmo central MCDA/WLC que calcula a aderência final ponderada de cada distrito paulistano.

---

## 🧠 Dados e Fontes de Informação

A plataforma integra dados públicos e estatísticos tratados, padronizados e normalizados no banco de dados para aplicação dos pesos operacionais.

Fontes de dados utilizadas:

- **Censo Demográfico (IBGE):** contagem populacional e área territorial dos distritos.
- **Fundação SEADE:** indicadores de idade média e projeções de dinâmicas sociais locais.
- **Secretaria de Segurança Pública (SSP-SP):** estatísticas oficiais de ocorrências registradas por distrito/ano.
- **Índice Paulista de Vulnerabilidade Social (IPVS):** níveis estruturais de vulnerabilidade socioeconômica da população residente.
- **Dados de Mobilidade (Metrô/CPTM):** geolocalização de estações e fluxo flutuante diário médio de embarque e desembarque nas plataformas.

Processos aplicados:
- Coleta e higienização das fontes oficiais.
- Normalização estatística linear (escala de 0 a 1) para viabilizar cálculos comparativos multicritério.
- Organização em banco de dados relacional integrado.
- Processamento em tempo real dos pesos dinâmicos do consultor.
- Renderização visual em mapas interativos e gráficos analíticos.

---

## 🛠️ Tecnologias Utilizadas

- **Front-End:** React.js / TypeScript / Vite / Tailwind CSS
- **Biblioteca de Mapas:** Leaflet / React-Leaflet / GeoJSON
- **Visualização de Dados:** Recharts / Lucide-React
- **Gerenciamento de Estado:** Zustand (armazenamento global reativo)
- **Persistência e Autenticação:** Supabase (PostgreSQL centralizado e Supabase Auth)
- **Análises de Dados e Modelagem:** Python, Pandas, Streamlit (administração interna de dados)
- **Design de Interface:** Figma
- **Hospedagem e Deploy:** Vercel (Front-end com CI/CD)

---

## 🔐 Segurança e Confiabilidade

O projeto adota práticas recomendadas de segurança para proteção da aplicação e integridade dos estudos estratégicos.

Medidas aplicadas:

- Autenticação criptografada robusta via Supabase Auth.
- Controle lógico e isolamento de projetos por consultor.
- Comunicação de dados integralmente criptografada via HTTPS/SSL.
- Modo de demonstração offline resiliente, garantindo disponibilidade mesmo sem conectividade de internet ou banco de dados.
- Segurança na persistência relacional com chaves estrangeiras e integridade referencial em PostgreSQL.

---

## 📌 Gestão do Projeto

Durante o desenvolvimento foram aplicados conceitos estruturados de gestão de projetos, como:

- Definição clara do objetivo e alinhamento estratégico.
- Project Charter e identificação de stakeholders.
- Plano de comunicação e alinhamento com os consultores.
- Cronograma de desenvolvimento incremental e controle de entregáveis.
- Gestão de riscos preventivos e mitigação técnica de erros de deploy.
- Encerramento formal do MVP para entrega em produção estável.

---

## ⚠️ Plano de Riscos e Contingência

Foram identificados e catalogados riscos relacionados ao funcionamento da aplicação no ambiente de produção:

- **Instabilidade em APIs e Banco Remoto:** mitigada pelo desenvolvimento e acionamento automático do modo offline de fallback de dados.
- **Inconsistência de Dados das Fontes:** tratada na fase de saneamento de dados com mapeamento de distritos nulos ou valores discrepantes.
- **Falha no Deploy em Produção:** mitigada pelo fluxo contínuo de compilação local pré-push (`npm run build`), garantindo commits estáveis.
- **Bugs em Módulos Visuais ou Estilos:** prevenidos pelo uso de tokens estruturados CSS e componentes centralizados.

---

## 🚀 Futuras Expansões

- Integração com novas bases de dados geoespaciais e ambientais.
- Criação de relatórios automatizados com exportação para múltiplos formatos analíticos adicionais.
- Comparação multidistrital simultânea (acima de 2 polos concurrentes).
- Módulo de projeção inteligente baseado em modelos estatísticos preditivos avançados.

---

## 📁 Estrutura do Projeto

```bash
Urbanis/
├── Documentos/
│   ├── Entrega 1/
│   │   ├── Cibersegurança e Defesa Cibernética/
│   │   ├── Ciência de Dados e Big Data/
│   │   ├── Empreendedorismo e Transformação Digital/
│   │   ├── Gestão de Projetos de Software/
│   │   └── Inteligência Artificial e Machine Learning/
│   ├── Entrega 2/
│   │   ├── Cibersegurança e Defesa Cibernética/
│   │   ├── Ciência de Dados e Big Data/
│   │   ├── Empreendedorismo e Transformação Digital/
│   │   ├── Gestão de Projetos de Software/
│   │   └── Inteligência Artificial e Machine Learning/
│   └── Banner/
│       └── banner_final.pdf
├── src/
│   ├── backend/
│   ├── frontend/
│   └── database/
├── README.md
└── .gitignore
```
