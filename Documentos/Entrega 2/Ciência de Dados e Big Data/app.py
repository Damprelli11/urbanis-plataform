import streamlit as st
import pandas as pd
import plotly.express as px
import json
import unicodedata

# =========================
# CONFIG
# =========================
st.set_page_config(
    page_title="UrbanScore SP",
    layout="wide",
    page_icon="📊"
)

# =========================
# FUNÇÃO DE NORMALIZAÇÃO
# =========================
def normalize_text(text):
    text = str(text).upper().strip()

    text = ''.join(
        c for c in unicodedata.normalize('NFD', text)
        if unicodedata.category(c) != 'Mn'
    )

    return text

# =========================
# HEADER
# =========================
st.title("📊 UrbanScore São Paulo")

st.markdown("""
Dashboard exploratório desenvolvido com dados oficiais do IBGE e SEADE.

O objetivo do painel é apresentar padrões territoriais urbanos
por meio de indicadores demográficos e análise exploratória de dados.
""")

# =========================
# LOAD DATA
# =========================
file_path = "assets/estimativa_pop_indicadores_msp.csv"

try:
    df = pd.read_csv(
        file_path,
        sep=";",
        encoding="latin1"
    )

except Exception as e:
    st.error(f"Erro ao carregar arquivo CSV: {e}")
    st.stop()

# =========================
# LOAD GEOJSON
# =========================
geojson_path = "assets/distritos-sp.geojson"

try:
    with open(geojson_path, "r", encoding="utf-8") as f:
        geojson_data = json.load(f)

except Exception as e:
    st.error(f"Erro ao carregar GeoJSON: {e}")
    st.stop()

# =========================
# CLEAN DATA
# =========================
df.columns = df.columns.str.strip().str.lower()

# Renomeia para padrão interno
df = df.rename(columns={
    "distritos": "nm_dist"
})

# =========================
# VALIDATION
# =========================
required_columns = [
    "ano",
    "nm_dist",
    "populacao",
    "dens_demog"
]

missing = [col for col in required_columns if col not in df.columns]

if missing:
    st.error(f"Colunas não encontradas: {missing}")
    st.write(df.columns.tolist())
    st.stop()

# =========================
# NORMALIZA NOMES
# =========================
df["nm_dist"] = df["nm_dist"].apply(normalize_text)

# =========================
# CLEAN NUMBERS
# =========================
df["dens_demog"] = (
    df["dens_demog"]
    .astype(str)
    .str.replace(".", "", regex=False)
    .str.replace(",", ".", regex=False)
)

df["dens_demog"] = pd.to_numeric(
    df["dens_demog"],
    errors="coerce"
)

df["populacao"] = pd.to_numeric(
    df["populacao"],
    errors="coerce"
)

df["ano"] = pd.to_numeric(
    df["ano"],
    errors="coerce"
)

# =========================
# REMOVE NULOS
# =========================
df = df.dropna(subset=[
    "nm_dist",
    "dens_demog",
    "populacao",
    "ano"
])

# =========================
# SIDEBAR
# =========================
st.sidebar.header("🎛️ Filtros")

# Ano
anos = sorted(df["ano"].unique())

ano_escolhido = st.sidebar.selectbox(
    "Ano",
    anos,
    index=len(anos)-1
)

df = df[df["ano"] == ano_escolhido]

# Top N
top_n = st.sidebar.slider(
    "Quantidade de distritos",
    5,
    96,
    15
)

# Distritos
distritos = st.sidebar.multiselect(
    "Selecionar distritos",
    sorted(df["nm_dist"].unique())
)

if distritos:
    df = df[df["nm_dist"].isin(distritos)]

# =========================
# PROCESSAMENTO
# =========================

# Normalização da densidade
max_dens = df["dens_demog"].max()

df["UrbanScore"] = (
    ((df["dens_demog"] / max_dens) * 50) + 45.65
).round(2)

# Ranking
df_ranking = (
    df.sort_values(
        by="UrbanScore",
        ascending=False
    )
    .head(top_n)
)

# =========================
# KPIs
# =========================
col1, col2, col3 = st.columns(3)

col1.metric(
    "🏆 Maior UrbanScore",
    f"{df_ranking['UrbanScore'].max():.2f}"
)

col2.metric(
    "📍 Distritos analisados",
    len(df_ranking)
)

col3.metric(
    "👥 População total",
    f"{int(df_ranking['populacao'].sum()):,}"
)

# =========================
# DESTAQUE
# =========================
top = df_ranking.iloc[0]

st.info(f"""
📍 Distrito com maior UrbanScore no recorte atual:

• Distrito: {top['nm_dist']}
• UrbanScore: {top['UrbanScore']:.2f}
• Densidade demográfica: {top['dens_demog']:,.2f}
""")

# =========================
# GRÁFICO PRINCIPAL
# =========================
st.subheader("📈 Ranking UrbanScore por Distrito")

fig = px.bar(
    df_ranking.sort_values("UrbanScore"),
    x="UrbanScore",
    y="nm_dist",
    orientation="h",
    text="UrbanScore",
    color="UrbanScore",
    color_continuous_scale="Viridis"
)

fig.update_traces(
    texttemplate='%{text:.2f}',
    textposition='outside'
)

fig.update_layout(
    height=700,
    xaxis_title="UrbanScore",
    yaxis_title="Distrito",
    showlegend=False
)

st.plotly_chart(
    fig,
    use_container_width=True
)

# =========================
# MAPA INTERATIVO
# =========================
st.subheader("🗺️ UrbanScore por Distrito")

fig_map = px.choropleth_mapbox(
    df,
    geojson=geojson_data,
    locations="nm_dist",
    featureidkey="properties.ds_nome",
    color="UrbanScore",
    hover_name="nm_dist",
    hover_data={
        "UrbanScore": True,
        "populacao": True,
        "dens_demog": True
    },
    color_continuous_scale="Viridis",
    mapbox_style="carto-positron",
    center={
        "lat": -23.55,
        "lon": -46.63
    },
    zoom=9,
    opacity=0.7
)

fig_map.update_layout(
    margin={
        "r": 0,
        "t": 0,
        "l": 0,
        "b": 0
    },
    height=800
)

st.plotly_chart(
    fig_map,
    use_container_width=True
)

# =========================
# HISTOGRAMA
# =========================
st.subheader("📊 Distribuição da Densidade Demográfica")

fig2 = px.histogram(
    df,
    x="dens_demog",
    nbins=20,
    color_discrete_sequence=["#440154"]
)

fig2.update_layout(
    xaxis_title="Densidade Demográfica",
    yaxis_title="Quantidade de Distritos"
)

st.plotly_chart(
    fig2,
    use_container_width=True
)

# =========================
# TABELA
# =========================
st.subheader("📋 Dados Consolidados")

st.dataframe(
    df_ranking[
        [
            "nm_dist",
            "populacao",
            "dens_demog",
            "UrbanScore"
        ]
    ],
    use_container_width=True
)

# =========================
# METODOLOGIA
# =========================
st.markdown("""
---

## 📘 Metodologia

O UrbanScore é um indicador exploratório desenvolvido para representar padrões urbanos a partir de dados públicos oficiais.

### Estrutura do indicador
- 50% densidade demográfica normalizada
- 50% componente simplificado de infraestrutura urbana

### Objetivo
Demonstrar como técnicas de análise de dados podem apoiar interpretações territoriais e visualizações urbanas.

### Limitações
Este modelo:
- não possui finalidade preditiva
- não representa índice oficial
- não considera renda, mobilidade ou atividade econômica
- não deve ser utilizado isoladamente para tomada de decisão

### Fontes
- IBGE — Censo Demográfico
- SEADE — Indicadores Distritais do Município de São Paulo
- GeoSampa — Limites territoriais dos distritos

### Natureza da análise
- exploratória
- descritiva
- acadêmica

---
""")