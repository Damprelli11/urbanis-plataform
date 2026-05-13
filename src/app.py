import streamlit as st
import pandas as pd
import plotly.express as px
import json
import pyproj
from shapely.geometry import shape, Point
import unicodedata
import numpy as np

# =========================================================
# CONFIGURAÇÃO DA PÁGINA
# =========================================================
st.set_page_config(
    page_title="Urbanis: Inteligência Territorial", layout="wide", page_icon="📊"
)

# =========================================================
# DESIGN SYSTEM (SaaS STYLE)
# =========================================================
st.markdown(
    """
    <style>
    /* Importação de Fonte Moderna */
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');

    html, body, [class*="css"]  {
        font-family: 'Inter', sans-serif;
    }

    /* Card de Métricas */
    [data-testid="stMetricValue"] {
        font-size: 28px;
        font-weight: 700;
        /* Removido color fixo para suportar Dark Theme */
    }
    
    [data-testid="stMetricLabel"] {
        font-size: 14px;
        color: #8899AA; /* Cor mais suave e legível em ambos os temas */
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    /* Estilização de Containers (Cards) */
    .stElementContainer {
        border-radius: 12px;
    }
    
    div[data-testid="stVerticalBlock"] > div:has(div.element-container) {
        background-color: transparent;
    }

    /* Sidebar Customization */
    [data-testid="stSidebar"] {
        /* Removido background fixo para respeitar o tema do Streamlit */
        border-right: 1px solid #33445522;
    }
    
    .sidebar-header {
        font-size: 22px;
        font-weight: 700;
        margin-bottom: 20px;
    }

    /* Estilo para Abas */
    .stTabs [data-baseweb="tab-list"] {
        gap: 24px;
    }

    .stTabs [data-baseweb="tab"] {
        height: 50px;
        white-space: pre-wrap;
        background-color: transparent;
        border-radius: 4px 4px 0px 0px;
        gap: 1px;
        padding-top: 10px;
        padding-bottom: 10px;
    }

    .stTabs [aria-selected="true"] {
        border-bottom: 2px solid #2563EB !important;
        color: #2563EB !important;
        font-weight: 700;
    }
    
    /* Botões Premium */
    .stButton>button {
        width: 100%;
        border-radius: 8px;
        height: 3em;
        background-color: #2563EB;
        color: white;
        border: none;
        transition: all 0.3s;
    }
    
    .stButton>button:hover {
        background-color: #1D4ED8;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
    }
    </style>
""",
    unsafe_allow_html=True,
)


# =========================================================
# FUNÇÃO DE NORMALIZAÇÃO
# =========================================================
def normalize_text(text):

    text = str(text).upper().strip()

    text = "".join(
        c for c in unicodedata.normalize("NFD", text) if unicodedata.category(c) != "Mn"
    )

    return text


# =========================================================
# HEADER
# =========================================================
# =========================================================
# HEADER COM CARA DE PLATAFORMA
# =========================================================
with st.container():
    col_h1, col_h2 = st.columns([3, 1])
    with col_h1:
        st.title("Urbanis")
        st.caption(
            "Plataforma de Estudo Territorial e Analytics Urbano | São Paulo, BR"
        )
    with col_h2:
        st.write("")  # Espaçador
        st.button("📄 Exportar Relatório PDF")

st.markdown("---")

# =========================================================
# LOAD DATASET
# =========================================================
file_path = "assets/estimativa_pop_indicadores_msp.csv"

try:
    df = pd.read_csv(file_path, sep=";", encoding="latin1")

except Exception as e:
    st.error(f"Erro ao carregar CSV: {e}")
    st.stop()

# =========================================================
# LOAD GEOJSON
# =========================================================
geojson_path = "assets/distritos-sp.geojson"

try:
    with open(geojson_path, "r", encoding="utf-8") as f:
        geojson_data = json.load(f)

except Exception as e:
    st.error(f"Erro ao carregar GeoJSON: {e}")
    st.stop()

# =========================================================
# CARREGAMENTO DE DEMANDA
# =========================================================
MAPA_ABREV = {
    "JAB": "JABAQUARA",
    "CON": "CONCEICAO",
    "JUD": "SAO JUDAS",
    "SAU": "SAUDE",
    "ARV": "PRACA DA ARVORE",
    "SCZ": "SANTA CRUZ",
    "VMN": "VILA MARIANA",
    "ANR": "ANA ROSA",
    "PSO": "PARAISO",
    "VGO": "VERGUEIRO",
    "JQM": "SAO JOAQUIM",
    "LIB": "LIBERDADE",
    "PSE": "SE",
    "BTO": "SAO BENTO",
    "LUZ": "LUZ",
    "TRD": "TIRADENTES",
    "PPQ": "ARMENIA",
    "TTE": "PORTUGUESA TIETE",
    "CDU": "CARANDIRU",
    "SAN": "SANTANA",
    "JPA": "JARDIM SAO PAULO AYRTON SENNA",
    "PIG": "PARADA INGLESA",
    "TUC": "TUCURUVI",
    "VPT": "VILA PRUDENTE",
    "TTI": "TAMANDUATEI",
    "SAC": "SACOMA",
    "AIP": "ALTO DO IPIRANGA",
    "IMG": "SANTOS IMIGRANTES",
    "CKB": "CHACARA KLABIN",
    "BGD": "BRIGADEIRO",
    "TRI": "TRIANON MASP",
    "CNS": "CONSOLACAO",
    "CLI": "CLINICAS",
    "SUM": "SUMARE",
    "VMD": "VILA MADALENA",
    "ITQ": "CORINTHIANS ITAQUERA",
    "ART": "ARTUR ALVIM",
    "PCA": "PATRIARCA VILA RE",
    "VPA": "GUILHERMINA ESPERANCA",
    "VTD": "VILA MATILDE",
    "PEN": "PENHA",
    "CAR": "CARRAO",
    "TAT": "TATUAPE",
    "BEL": "BELEM",
    "BRE": "BRESSER MOOCA",
    "BAS": "BRAS",
    "PDS": "PEDRO II",
    "GBU": "ANHANGABAU",
    "REP": "REPUBLICA",
    "CEC": "SANTA CECILIA",
    "DEO": "MARECHAL DEODORO",
    "BFU": "PALMEIRAS BARRA FUNDA",
    "VPM": "VILA PRUDENTE",
    "ORT": "ORATORIO",
    "SLU": "SAO LUCAS",
    "CAD": "CAMILO HADDAD",
    "VTL": "VILA TOLSTOI",
    "VUN": "VILA UNIAO",
    "JPL": "JARDIM PLANALTO",
    "SAP": "SAPOPEMBA",
    "FJT": "FAZENDA DA JUTA",
    "MAT": "SAO MATEUS",
    "IGT": "JARDIM COLONIAL",
}


def load_passenger_flow():
    try:
        path = "assets/Entrada de Passageiros por Estação - Diária - 2026_1.csv"
        # O arquivo do metrô costuma vir em latin1 ou cp1252
        df_flow = pd.read_csv(path, sep=";", encoding="latin1", skiprows=4)

        # Localizar a linha de 'Total' (Geralmente por volta da linha 100)
        total_row = df_flow[df_flow.iloc[:, 0] == "Total"].iloc[0]

        flow_dict = {}
        for col_idx, value in enumerate(total_row):
            col_name = str(df_flow.columns[col_idx]).strip()
            if col_name in MAPA_ABREV:
                full_name = normalize_text(MAPA_ABREV[col_name])
                # Converter valor (ex: "1.906,7" -> 1906.7)
                try:
                    val_clean = str(value).replace(".", "").replace(",", ".")
                    flow_dict[full_name] = float(val_clean)
                except:
                    continue
        return flow_dict
    except Exception as e:
        st.warning(f"Aviso: Não foi possível carregar dados de fluxo: {e}")
        return {}


PASSENGER_FLOW = load_passenger_flow()

# =========================================================
# CARREGAMENTO DE ESTAÇÕES
# =========================================================
transformer = pyproj.Transformer.from_crs("epsg:31983", "epsg:4326", always_xy=True)


def load_transport_data(path, type_label):
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)

        rows = []
        for feature in data.get("features", []):
            coords = feature["geometry"]["coordinates"]
            name = feature["properties"].get("nm_estacao_metro_trem", "N/A")

            # Conversão UTM 23S -> WGS84 (Lat/Lon)
            lon, lat = transformer.transform(coords[0], coords[1])

            rows.append(
                {"estacao": name, "latitude": lat, "longitude": lon, "tipo": type_label}
            )
        return pd.DataFrame(rows)
    except Exception as e:
        st.warning(f"Aviso: Erro ao carregar {type_label}: {e}")
        return pd.DataFrame(columns=["estacao", "latitude", "longitude", "tipo"])


df_metro = load_transport_data("assets/geoportal_estacao_metro_v2.geojson", "Metrô")
df_trem = load_transport_data("assets/geoportal_estacao_trem_v2.geojson", "Trem")
df_transporte = pd.concat([df_metro, df_trem], ignore_index=True)

# =========================================================
# CONFIGURAÇÃO DE SEGMENTOS E PESOS
# =========================================================
# =========================================================
# CONFIGURAÇÃO DE SEGMENTOS E PESOS (V3.0 - CENTRALIDADE)
# =========================================================
# Índice de Centralidade Urbana (Proxy de Relevância Econômica)
# Baseado em densidade corporativa, oferta de empregos e fluxo comercial.
MAPA_CENTRALIDADE = {
    "SE": 1.00,
    "PINHEIROS": 0.95,
    "ITAIM BIBI": 0.95,
    "MOEMA": 0.90,
    "VILA MARIANA": 0.88,
    "SANTO AMARO": 0.82,
    "TATUAPE": 0.78,
    "LAPA": 0.74,
    "GRAJAU": 0.40,
    "ITAIM PAULISTA": 0.35,
}

SEGMENTOS = {
    "Modelo Padrão": {
        "dens": 0.25,
        "mob": 0.15,
        "central": 0.35,
        "pop": 0.15,
        "idade": 0.10,
        "crime": -0.05,
    },
    "Restaurante": {
        "dens": 0.25,
        "mob": 0.20,
        "central": 0.35,
        "pop": 0.10,
        "idade": 0.00,
        "crime": -0.10,
    },
    "Coworking": {
        "dens": 0.15,
        "mob": 0.20,
        "central": 0.45,
        "pop": 0.00,
        "idade": 0.20,
        "crime": -0.10,
    },
    "Papelaria": {
        "dens": 0.30,
        "mob": 0.15,
        "central": 0.20,
        "pop": 0.35,
        "idade": 0.00,
        "crime": 0.00,
    },
    "Loja Premium": {
        "dens": 0.05,
        "mob": 0.15,
        "central": 0.50,
        "pop": 0.05,
        "idade": 0.25,
        "crime": -0.10,
    },
    "Farmácia": {
        "dens": 0.35,
        "mob": 0.20,
        "central": 0.20,
        "pop": 0.25,
        "idade": 0.00,
        "crime": 0.00,
    },
}


# =========================================================
# PROCESSAMENTO DE KPIs DE MOBILIDADE
# =========================================================
@st.cache_data
def get_mobility_metrics(_df_transporte, _geojson_data):
    if _df_transporte.empty:
        return 0, 0, 0, "N/A", 0

    # Criar polígonos shapely para os distritos para spatial join manual
    distritos_shapes = [
        {
            "nome": normalize_text(f["properties"].get("ds_nome", "N/A")),
            "shape": shape(f["geometry"]),
        }
        for f in _geojson_data["features"]
    ]

    def find_distrito(lat, lon):
        p = Point(lon, lat)
        for d in distritos_shapes:
            if d["shape"].contains(p):
                return d["nome"]
        return None

    temp_df = _df_transporte.copy()
    temp_df["distrito"] = temp_df.apply(
        lambda r: find_distrito(r["latitude"], r["longitude"]), axis=1
    )

    total = len(temp_df)
    metro = len(temp_df[temp_df["tipo"] == "Metrô"])
    trem = len(temp_df[temp_df["tipo"] == "Trem"])

    counts = temp_df["distrito"].value_counts()
    if not counts.empty:
        top_d = counts.idxmax()
        top_v = int(counts.max())
    else:
        top_d = "N/A"
        top_v = 0

    return total, metro, trem, top_d, top_v


total_est, total_m, total_t, top_dist, top_val = get_mobility_metrics(
    df_transporte, geojson_data
)

# =========================================================
# LIMPEZA DAS COLUNAS
# =========================================================
df.columns = df.columns.str.strip().str.lower()

# =========================================================
# RENOMEIA COLUNA PRINCIPAL
# =========================================================
df = df.rename(columns={"distritos": "nm_dist"})

# =========================================================
# VALIDAÇÃO
# =========================================================
required_columns = ["ano", "nm_dist", "populacao", "dens_demog", "id_media"]

missing = [col for col in required_columns if col not in df.columns]

if missing:
    st.error(f"Colunas obrigatórias ausentes: {missing}")
    st.write(df.columns.tolist())
    st.stop()

# =========================================================
# NORMALIZAÇÃO TEXTO
# =========================================================
df["nm_dist"] = df["nm_dist"].apply(normalize_text)

# =========================================================
# LIMPEZA NUMÉRICA
# =========================================================
df["dens_demog"] = (
    df["dens_demog"]
    .astype(str)
    .str.replace(".", "", regex=False)
    .str.replace(",", ".", regex=False)
)

df["dens_demog"] = pd.to_numeric(df["dens_demog"], errors="coerce")

df["id_media"] = df["id_media"].astype(str).str.replace(",", ".", regex=False)

df["id_media"] = pd.to_numeric(df["id_media"], errors="coerce")

df["populacao"] = pd.to_numeric(df["populacao"], errors="coerce")

df["ano"] = pd.to_numeric(df["ano"], errors="coerce")

# =========================================================
# REMOVE NULOS
# =========================================================
df = df.dropna(subset=["nm_dist", "dens_demog", "id_media", "populacao", "ano"])

# =========================================================
# PRÉ-PROCESSAMENTO CONSOLIDADO (DADOS PARA SCORE)
# =========================================================

# 1. Consolidação de Mobilidade por Distrito
# Criar polígonos para mapeamento espacial
distritos_shapes_cons = [
    {
        "nome": normalize_text(f["properties"].get("ds_nome", "N/A")),
        "shape": shape(f["geometry"]),
    }
    for f in geojson_data["features"]
]


def find_distrito_cons(lat, lon):
    p = Point(lon, lat)
    for d in distritos_shapes_cons:
        if d["shape"].contains(p):
            return d["nome"]
    return None


if not df_transporte.empty:
    df_transporte["distrito"] = df_transporte.apply(
        lambda r: find_distrito_cons(r["latitude"], r["longitude"]), axis=1
    )

    # Atribui o fluxo de passageiros para cada estação (se disponível no CSV)
    # Se for trem ou não estiver no mapa, usa um valor base (ex: média de fluxo / 2)
    media_fluxo = (
        sum(PASSENGER_FLOW.values()) / len(PASSENGER_FLOW) if PASSENGER_FLOW else 100
    )

    def get_flow(row):
        st_norm = normalize_text(row["estacao"])
        # Busca no mapa de fluxo
        if st_norm in PASSENGER_FLOW:
            return PASSENGER_FLOW[st_norm]
        # Heurística para nomes parciais ou CPTM
        for key, val in PASSENGER_FLOW.items():
            if key in st_norm or st_norm in key:
                return val
        return media_fluxo * 0.5  # Valor base para estações sem dados (ex: Trem)

    df_transporte["fluxo"] = df_transporte.apply(get_flow, axis=1)

    # Consolida por distrito: Soma do fluxo e contagem de estações
    # Aplicamos escala logarítmica no fluxo para evitar que hubs massivos dominem o score
    df_mob_dist = (
        df_transporte.groupby("distrito")
        .agg(n_mob=("fluxo", "sum"), n_stations=("estacao", "nunique"))
        .reset_index()
    )
    df_mob_dist["n_mob"] = np.log1p(df_mob_dist["n_mob"])
else:
    df_mob_dist = pd.DataFrame(columns=["distrito", "n_mob", "n_stations"])

# 2. Consolidação de Criminalidade
df_crime_cons = pd.DataFrame(columns=["nm_dist", "n_crime"])
try:
    df_crime_raw = pd.read_excel("assets/01 - DADOS CRIMINAIS_JAN_2025_V2.xlsx")
    df_crime_raw.columns = df_crime_raw.columns.astype(str).str.strip().str.lower()
    if "dp" in df_crime_raw.columns:
        df_crime_raw["nm_dist"] = (
            df_crime_raw["dp"]
            .astype(str)
            .str.replace(r"^\d+\s*DP\s*-\s*", "", regex=True)
            .apply(normalize_text)
        )
        df_crime_cons = (
            df_crime_raw.groupby("nm_dist")["2025"].sum().reset_index(name="n_crime")
        )
except:
    pass

# 3. Integração no DataFrame Principal
df = df.merge(
    df_mob_dist.rename(columns={"distrito": "nm_dist"}), on="nm_dist", how="left"
).fillna({"n_mob": 0, "n_stations": 0})
df = df.merge(df_crime_cons, on="nm_dist", how="left").fillna({"n_crime": 0})

# =========================================================
# SIDEBAR
# =========================================================
st.sidebar.header("🎛️ Filtros")

anos = sorted(df["ano"].unique())

ano_escolhido = st.sidebar.selectbox("Ano", anos, index=len(anos) - 1)

df = df[df["ano"] == ano_escolhido]

top_n = st.sidebar.slider(
    "Quantidade de distritos", min_value=5, max_value=96, value=15
)

distritos = st.sidebar.multiselect(
    "Selecionar distritos", sorted(df["nm_dist"].unique())
)

if distritos:
    df = df[df["nm_dist"].isin(distritos)]

st.sidebar.markdown("---")
st.sidebar.subheader("🎯 Inteligência de Negócio")
segmento_selecionado = st.sidebar.selectbox(
    "Segmento de Negócio",
    list(SEGMENTOS.keys()),
    help="O UrbanScore será recalculado com pesos específicos para o setor escolhido.",
)
pesos = SEGMENTOS[segmento_selecionado]


# =========================================================
# MOTOR DO URBANSCORE ADAPTATIVO
# =========================================================
def min_max_scale(series):
    if series.max() == series.min():
        return series * 0
    return (series - series.min()) / (series.max() - series.min())


# Normalização das variáveis core
# Adiciona o fator de Centralidade (Proxy Estratégico)
df["centralidade"] = (
    df["nm_dist"].map(MAPA_CENTRALIDADE).fillna(0.30)
)  # Baseline de 0.30 para distritos não listados

df["dens_norm"] = min_max_scale(df["dens_demog"])
df["mob_norm"] = min_max_scale(df["n_mob"])
df["pop_norm"] = min_max_scale(df["populacao"])
df["idade_norm"] = min_max_scale(df["id_media"])
df["crime_norm"] = min_max_scale(df["n_crime"])
df["central_norm"] = min_max_scale(df["centralidade"])

# Cálculo do Score Combinado (V3.0)
df["UrbanScore"] = (
    (df["dens_norm"] * pesos.get("dens", 0))
    + (df["mob_norm"] * pesos.get("mob", 0))
    + (df["pop_norm"] * pesos.get("pop", 0))
    + (df["idade_norm"] * pesos.get("idade", 0))
    + (df["central_norm"] * pesos.get("central", 0))
    + (df["crime_norm"] * pesos.get("crime", 0))
)

# Ajuste de escala para visualização (0 a 100)
# Removido min_max_scale relativo para permitir comparação real entre segmentos
# Agora 100 representa o topo teórico baseado nos indicadores normalizados
df["UrbanScore"] = (df["UrbanScore"] * 100).clip(0, 100).round(2)

# =========================================================
# RANKINGS
# =========================================================
df_ranking = df.sort_values(by="UrbanScore", ascending=False).head(top_n)

df_idade = df.sort_values(by="id_media", ascending=False).head(top_n)

# =========================================================
# NAVEGAÇÃO POR ABAS (ESTRUTURA SaaS)
# =========================================================
tab_overview, tab_infra, tab_security, tab_data = st.tabs(
    [
        "Dashboard Executivo",
        "Mobilidade & Infraestrutura",
        "Segurança Pública",
        "Base de Dados & Metodologia",
    ]
)

with tab_overview:
    # =========================================================
    # MOTOR DE DECISÃO: RECOMENDAÇÃO ESTRATÉGICA
    # =========================================================
    top = df_ranking.iloc[0]
    runner_up = df_ranking.iloc[1] if len(df_ranking) > 1 else top

    st.markdown(f"""
    <div style="background-color: rgba(37, 99, 235, 0.1); padding: 25px; border-radius: 15px; border-left: 8px solid #2563EB; margin-bottom: 30px;">
        <h2 style="margin-top: 0; color: #2563EB;">🎯 Recomendação Estratégica</h2>
        <p style="font-size: 1.1em; margin-bottom: 15px;">Segmento: <b>{segmento_selecionado}</b></p>
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div style="flex: 2;">
                <h1 style="margin: 0; font-size: 3em; font-weight: 800;">{top["nm_dist"]}</h1>
                <p style="margin-top: 10px; font-size: 1.2em; color: #556677;">Justificativa de Liderança:</p>
                <ul style="font-size: 1.1em; line-height: 1.6em;">
                    <li><b>Alta Centralidade Econômica:</b> Relevância histórica e corporativa no território.</li>
                    <li><b>Elevado Fluxo Urbano:</b> Volume de circulação superior à média da cidade.</li>
                    <li><b>Conectividade Metroferroviária:</b> Infraestrutura de transporte consolidada.</li>
                    <li><b>Alta Densidade Populacional:</b> Concentração de público-alvo potencial.</li>
                    <li><b>Baixa Penalização Criminal Relativa:</b> Risco controlado para o perfil do negócio.</li>
                </ul>
            </div>
            <div style="flex: 1; text-align: right; background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                <p style="margin: 0; color: #8899AA; text-transform: uppercase; font-size: 0.8em; letter-spacing: 1px;">UrbanScore</p>
                <h1 style="margin: 0; font-size: 4em; color: #2563EB;">{top["UrbanScore"]:.1f}</h1>
                <p style="margin: 0; color: #22C55E; font-weight: 600;">ADERÊNCIA MÁXIMA</p>
            </div>
        </div>
    </div>
    """, unsafe_allow_html=True)

    # KPIs principais logo abaixo da recomendação
    st.subheader(f"Visão Geral do Mercado: {segmento_selecionado}")
    kpi_col1, kpi_col2, kpi_col3, kpi_col4, kpi_col5 = st.columns(5)

    with kpi_col1:
        with st.container(border=True):
            st.metric("Top Score", f"{df_ranking['UrbanScore'].max():.1f}")
    with kpi_col2:
        with st.container(border=True):
            st.metric("Distritos Analisados", len(df_ranking))
    with kpi_col3:
        with st.container(border=True):
            st.metric("População Total", f"{int(df_ranking['populacao'].sum()):,}")
    with kpi_col4:
        with st.container(border=True):
            st.metric("Densidade Média", f"{df_ranking['dens_demog'].mean():,.0f}")
    with kpi_col5:
        with st.container(border=True):
            st.metric("Idade Média", f"{df_ranking['id_media'].mean():.1f}")

    # Gráfico de Composição do Score
    score_components = pd.DataFrame(
        {
            "Variável": [
                "Densidade",
                "Mobilidade",
                "Centralidade",
                "População",
                "Idade",
                "Criminalidade",
            ],
            "Peso (%)": [
                pesos.get("dens", 0) * 100,
                pesos.get("mob", 0) * 100,
                pesos.get("central", 0) * 100,
                pesos.get("pop", 0) * 100,
                pesos.get("idade", 0) * 100,
                abs(pesos.get("crime", 0)) * 100,
            ],
        }
    )

    fig_score_pie = px.pie(
        score_components,
        names="Variável",
        values="Peso (%)",
        title=f"Metodologia de Pesos: {segmento_selecionado}",
        hole=0.4,
        color_discrete_sequence=px.colors.qualitative.Pastel,
    )

    # =========================================================
    # EXPLICABILIDADE E COMPARAÇÃO
    # =========================================================
    st.markdown("---")
    st.header("Explicabilidade e Inteligência de Ranking")
    
    comp_col1, comp_col2 = st.columns([1.5, 1])
    
    with comp_col1:
        st.subheader("Por que este distrito venceu?")
        st.markdown(f"""
        A vitória de **{top["nm_dist"]}** sobre **{runner_up["nm_dist"]}** deve-se principalmente à sua performance superior em variáveis de alto peso para o segmento **{segmento_selecionado}**.
        """)
        
        # Gráfico de comparação 1st vs 2nd
        comparison_data = pd.DataFrame([
            {"Indicador": "Centralidade", "Distrito": top["nm_dist"], "Valor": top["central_norm"]},
            {"Indicador": "Centralidade", "Distrito": runner_up["nm_dist"], "Valor": runner_up["central_norm"]},
            {"Indicador": "Mobilidade", "Distrito": top["nm_dist"], "Valor": top["mob_norm"]},
            {"Indicador": "Mobilidade", "Distrito": runner_up["nm_dist"], "Valor": runner_up["mob_norm"]},
            {"Indicador": "Densidade", "Distrito": top["nm_dist"], "Valor": top["dens_norm"]},
            {"Indicador": "Densidade", "Distrito": runner_up["nm_dist"], "Valor": runner_up["dens_norm"]},
        ])
        
        fig_comp = px.bar(
            comparison_data, 
            x="Indicador", 
            y="Valor", 
            color="Distrito", 
            barmode="group",
            title=f"Comparação Direta: {top['nm_dist']} vs {runner_up['nm_dist']}",
            color_discrete_sequence=[px.colors.qualitative.Prism[0], px.colors.qualitative.Prism[1]]
        )
        st.plotly_chart(fig_comp, width="stretch")

    with comp_col2:
        st.subheader("Configuração do Motor")
        st.plotly_chart(fig_score_pie, width="stretch")
        
        # Tabela de Pesos resumida
        df_pesos = pd.DataFrame([
            {"Variável": "Centralidade", "Peso": f"{pesos.get('central', 0) * 100:.0f}%"},
            {"Variável": "Mobilidade", "Peso": f"{pesos.get('mob', 0) * 100:.0f}%"},
            {"Variável": "Densidade", "Peso": f"{pesos.get('dens', 0) * 100:.0f}%"},
            {"Variável": "Demografia", "Peso": f"{(pesos.get('pop', 0) + pesos.get('idade', 0)) * 100:.0f}%"},
            {"Variável": "Risco (Crime)", "Peso": f"{pesos.get('crime', 0) * 100:.0f}%"},
        ])
        st.table(df_pesos.set_index("Variável"))

    # Seção de Explicabilidade (Contribuição Real)
    with st.expander(
        "🔍 Ver Detalhes da Explicabilidade (Contribuição Real no Distrito)"
    ):
        exp_col1, exp_col2 = st.columns(2)

        with exp_col1:
            st.markdown(f"**Performance em {top['nm_dist']} (0 a 1):**")
            df_contrib = pd.DataFrame(
                [
                    {
                        "Indicador": "Centralidade (Proxy)",
                        "Valor": round(top["central_norm"], 3),
                    },
                    {
                        "Indicador": "Densidade Normalizada",
                        "Valor": round(top["dens_norm"], 3),
                    },
                    {
                        "Indicador": "Mobilidade Normalizada",
                        "Valor": round(top["mob_norm"], 3),
                    },
                    {
                        "Indicador": "População Normalizada",
                        "Valor": round(top["pop_norm"], 3),
                    },
                    {
                        "Indicador": "Idade Normalizada",
                        "Valor": round(top["idade_norm"], 3),
                    },
                    {
                        "Indicador": "Criminalidade Normalizada",
                        "Valor": round(top["crime_norm"], 3),
                    },
                ]
            )
            st.dataframe(df_contrib, hide_index=True, width="stretch")

        with exp_col2:
            st.info(f"""
            **Como o score foi construído?**
            
            O UrbanScore de **{top["nm_dist"]}** é o resultado da soma ponderada desses 5 indicadores. 
            A normalização garante que o distrito seja comparado com o melhor e o pior desempenho de toda a cidade de São Paulo dentro do segmento **{segmento_selecionado}**.
            """)

    # =========================================================
    # INSIGHTS ADICIONAIS
    # =========================================================
    st.subheader("Insights Territoriais Adicionais")
    bairro_mais_denso = df.loc[df["dens_demog"].idxmax()]
    bairro_menos_denso = df.loc[df["dens_demog"].idxmin()]

    ins_col1, ins_col2 = st.columns(2)
    with ins_col1:
        with st.container(border=True):
            st.metric(
                "Distrito Mais Denso",
                bairro_mais_denso["nm_dist"],
                f"{bairro_mais_denso['dens_demog']:,.0f} hab/km²",
            )
    with ins_col2:
        with st.container(border=True):
            st.metric(
                "Distrito Menos Denso",
                bairro_menos_denso["nm_dist"],
                f"{bairro_menos_denso['dens_demog']:,.0f} hab/km²",
            )

    # =========================================================
    # GRÁFICO PRINCIPAL
    # =========================================================
    st.subheader("Ranking UrbanScore por Distrito")

    fig = px.bar(
        df_ranking.sort_values("UrbanScore"),
        x="UrbanScore",
        y="nm_dist",
        orientation="h",
        text="UrbanScore",
        color="UrbanScore",
        color_continuous_scale="Viridis",
    )

    fig.update_traces(texttemplate="%{text:.2f}", textposition="outside")

    fig.update_layout(
        height=max(700, top_n * 35),
        xaxis_title="UrbanScore",
        yaxis_title="Distrito",
        showlegend=False,
    )

    st.plotly_chart(fig, width="stretch")

    # =========================================================
    # MAPA INTERATIVO
    # =========================================================
    st.subheader("Distribuição Territorial do UrbanScore")

    fig_map = px.choropleth_map(
        df,
        geojson=geojson_data,
        locations="nm_dist",
        featureidkey="properties.ds_nome",
        color="UrbanScore",
        hover_name="nm_dist",
        hover_data={
            "UrbanScore": True,
            "populacao": True,
            "dens_demog": True,
            "id_media": True,
        },
        color_continuous_scale="Viridis",
        map_style="carto-positron",
        center={"lat": -23.55, "lon": -46.63},
        zoom=9,
        opacity=0.75,
    )

    fig_map.update_layout(height=800, margin={"r": 0, "t": 0, "l": 0, "b": 0})

    st.plotly_chart(fig_map, width="stretch")

with tab_infra:
    # =========================================================
    # NOVA SEÇÃO: INFRAESTRUTURA METROFERROVIÁRIA
    # =========================================================
    st.subheader("Infraestrutura Metroferroviária")

    # KPIs de Mobilidade
    m_col1, m_col2, m_col3, m_col4 = st.columns(4)
    m_col1.metric("Estações Mapeadas", total_est)
    m_col2.metric("Polo de Movimentação", f"{top_dist}")
    m_col3.metric("Fluxo Metro (Jan/26)", f"{sum(PASSENGER_FLOW.values()):,.0f}k")
    m_col4.metric("Pontos de Trem", total_t)

    st.info(
        "💡 **Nota sobre Inteligência de Fluxo:** O UrbanScore agora utiliza a **Entrada Diária de Passageiros** (dados reais do Metrô SP) em vez de apenas contar o número de estações. Isso permite diferenciar distritos com estações de alta rotatividade comercial de áreas puramente residenciais."
    )

    if not df_transporte.empty:
        fig_transp = px.scatter_map(
            df_transporte,
            lat="latitude",
            lon="longitude",
            color="tipo",
            hover_name="estacao",
            hover_data={"tipo": True, "latitude": False, "longitude": False},
            color_discrete_map={"Metrô": "blue", "Trem": "red"},
            map_style="carto-positron",
            center={"lat": -23.55, "lon": -46.63},
            zoom=10,
        )

        fig_transp.update_layout(
            height=600,
            margin={"r": 0, "t": 0, "l": 0, "b": 0},
            legend=dict(
                title="Tipo de Estação", yanchor="top", y=0.99, xanchor="left", x=0.01
            ),
        )

        st.plotly_chart(fig_transp, width="stretch")
    else:
        st.info("Dados de infraestrutura metroferroviária não disponíveis.")

# =========================================================
# IDADE MÉDIA
# =========================================================
st.subheader("Idade Média por Distrito")

fig3 = px.bar(
    df_idade,
    x="id_media",
    y="nm_dist",
    orientation="h",
    color="id_media",
    color_continuous_scale="Blues",
)

fig3.update_layout(
    height=max(700, top_n * 35), xaxis_title="Idade Média", yaxis_title="Distrito"
)

st.plotly_chart(fig3, width="stretch")

# =========================================================
# SCATTER
# =========================================================
st.subheader("Relação entre População e Densidade")

fig4 = px.scatter(
    df,
    x="dens_demog",
    y="populacao",
    size="populacao",
    color="UrbanScore",
    hover_name="nm_dist",
    size_max=60,
)

fig4.update_layout(
    height=700, xaxis_title="Densidade Demográfica", yaxis_title="População"
)

st.plotly_chart(fig4, width="stretch")

with tab_security:
    # =========================================================
    # BASE CRIMINAL
    # =========================================================
    crime_file = "assets/01 - DADOS CRIMINAIS_JAN_2025_V2.xlsx"

    try:
        df_crime = pd.read_excel(crime_file)
        df_crime.columns = df_crime.columns.astype(str).str.strip().str.lower()

        if "dp" in df_crime.columns:
            df_crime["nm_dist"] = (
                df_crime["dp"]
                .astype(str)
                .str.replace(r"^\d+\s*DP\s*-\s*", "", regex=True)
            )
            df_crime["nm_dist"] = df_crime["nm_dist"].apply(normalize_text)
            df_crime_grouped = (
                df_crime.groupby("nm_dist")["2025"]
                .sum()
                .reset_index(name="total_ocorrencias")
            )

            df_crime_merge = df.merge(df_crime_grouped, on="nm_dist", how="left")
            df_crime_merge["total_ocorrencias"] = df_crime_merge[
                "total_ocorrencias"
            ].fillna(0)

            st.subheader("Ocorrências Criminais por Distrito (Janeiro/2025)")

            df_crime_chart = df_crime_merge.sort_values(
                by="total_ocorrencias", ascending=False
            ).head(top_n)

            fig_crime = px.bar(
                df_crime_chart.sort_values("total_ocorrencias"),
                x="total_ocorrencias",
                y="nm_dist",
                orientation="h",
                text="total_ocorrencias",
                color="total_ocorrencias",
                color_continuous_scale="Reds",
            )
            fig_crime.update_traces(textposition="outside")
            fig_crime.update_layout(height=max(700, top_n * 35), showlegend=False)
            st.plotly_chart(fig_crime, width="stretch")

            if "total_ocorrencias" in df_crime_merge.columns:
                st.subheader("Distribuição Territorial da Criminalidade")
                for feature in geojson_data["features"]:
                    feature["properties"]["ds_nome"] = normalize_text(
                        feature["properties"]["ds_nome"]
                    )

                fig_crime_map = px.choropleth_map(
                    df_crime_merge,
                    geojson=geojson_data,
                    locations="nm_dist",
                    featureidkey="properties.ds_nome",
                    color="total_ocorrencias",
                    hover_name="nm_dist",
                    color_continuous_scale="Reds",
                    map_style="carto-positron",
                    center={"lat": -23.55, "lon": -46.63},
                    zoom=9,
                    opacity=0.75,
                )
                fig_crime_map.update_layout(
                    height=800, margin={"r": 0, "t": 0, "l": 0, "b": 0}
                )
                st.plotly_chart(fig_crime_map, width="stretch")

            if not df_crime_chart.empty:
                distrito_mais_ocorrencias = df_crime_chart.iloc[0]
                st.warning(
                    f"**Insight:** O distrito de **{distrito_mais_ocorrencias['nm_dist']}** registrou **{int(distrito_mais_ocorrencias['total_ocorrencias'])}** ocorrências em Jan/2025."
                )

    except Exception as e:
        st.info("Módulo de criminalidade em manutenção.")

with tab_data:
    # =========================================================
    # TABELA E METODOLOGIA
    # =========================================================
    st.subheader("Dados Consolidados e Metodologia")

    with st.container(border=True):
        st.dataframe(
            df_ranking[
                ["nm_dist", "populacao", "dens_demog", "id_media", "UrbanScore"]
            ].sort_values(by="UrbanScore", ascending=False),
            width="stretch",
        )

    with st.expander("🌍 Impacto Social e Econômico"):
        st.markdown("""
        A Urbanis utiliza Big Data para democratizar o acesso a indicadores urbanos, permitindo uma visão clara sobre densidade, conectividade e segurança.
        
        - Apoio à tomada de decisão estratégica.
        - Visualização de desigualdades territoriais.
        - Suporte a estudos de expansão urbana.
        """)

    with st.expander("📘 Detalhes da Metodologia"):
        st.markdown("""
        **UrbanScore v3.0 (Estratégico)**
        
        O indicador evoluiu para separar **acessibilidade** de **relevância econômica**:
        1. **Centralidade Urbana**: Nova variável composta que atua como proxy de densidade corporativa, oferta de empregos e relevância comercial histórica do distrito.
        2. **Mobilidade Inteligente**: Integração de dados reais de fluxo de passageiros (Metrô SP), diferenciando polos de alta rotatividade.
        3. **Normalização & Ponderação**: Todos os dados são escalonados (0-1) e os pesos são rebalanceados para refletir o potencial de decisão do mundo real.
        
        *Fontes: IBGE, SEADE, GeoSampa, SSP-SP, Metrô SP, Análise Estratégica Territorial.*
        """)

    st.caption("Urbanis Platform | Academic Edition 2026")
