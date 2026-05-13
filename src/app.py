import streamlit as st
import pandas as pd
import plotly.express as px
import json
import pyproj
from shapely.geometry import shape, Point
import unicodedata

# =========================================================
# CONFIGURAÇÃO DA PÁGINA
# =========================================================
st.set_page_config(
    page_title="Urbanis: Inteligência Territorial", layout="wide", page_icon="📊"
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
st.title("📊 Urbanis: Inteligência Territorial")

st.markdown("""
### Plataforma de Análise Urbana e Exploração Territorial

A Urbanis é uma plataforma exploratória de análise territorial desenvolvida com dados públicos oficiais do município de São Paulo.

O projeto utiliza técnicas de Big Data, visualização analítica e inteligência territorial para transformar dados urbanos em informações interpretáveis.
""")

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
# CARREGAMENTO DE ESTAÇÕES (METRÔ E TREM)
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
SEGMENTOS = {
    "Modelo Padrão": {
        "dens": 0.50,
        "mob": 0.20,
        "pop": 0.15,
        "idade": 0.10,
        "crime": -0.05,
    },
    "Restaurante": {
        "dens": 0.30,
        "mob": 0.35,
        "pop": 0.20,
        "idade": 0.00,
        "crime": -0.15,
    },
    "Coworking": {
        "dens": 0.25,
        "mob": 0.40,
        "pop": 0.00,
        "idade": 0.25,
        "crime": -0.10,
    },
    "Papelaria": {"dens": 0.40, "mob": 0.25, "pop": 0.35, "idade": 0.00, "crime": 0.00},
    "Loja Premium": {
        "dens": 0.10,
        "mob": 0.30,
        "pop": 0.10,
        "idade": 0.40,
        "crime": -0.10,
    },
    "Farmácia": {"dens": 0.45, "mob": 0.30, "pop": 0.25, "idade": 0.00, "crime": 0.00},
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
    df_mob_dist = df_transporte.groupby("distrito").size().reset_index(name="n_mob")
else:
    df_mob_dist = pd.DataFrame(columns=["distrito", "n_mob"])

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
).fillna({"n_mob": 0})
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
df["dens_norm"] = min_max_scale(df["dens_demog"])
df["mob_norm"] = min_max_scale(df["n_mob"])
df["pop_norm"] = min_max_scale(df["populacao"])
df["idade_norm"] = min_max_scale(df["id_media"])
df["crime_norm"] = min_max_scale(df["n_crime"])

# Cálculo do Score Combinado
df["UrbanScore"] = (
    (df["dens_norm"] * pesos["dens"])
    + (df["mob_norm"] * pesos["mob"])
    + (df["pop_norm"] * pesos["pop"])
    + (df["idade_norm"] * pesos["idade"])
    + (
        df["crime_norm"] * pesos["crime"]
    )  # Note que o peso do crime já é negativo no dicionário
)

# Ajuste de escala para visualização (0 a 100)
df["UrbanScore"] = (min_max_scale(df["UrbanScore"]) * 100).round(2)

# =========================================================
# RANKINGS
# =========================================================
df_ranking = df.sort_values(by="UrbanScore", ascending=False).head(top_n)

df_idade = df.sort_values(by="id_media", ascending=False).head(top_n)

# =========================================================
# KPIs
# =========================================================
st.subheader(f"📌 Indicadores Gerais: {segmento_selecionado}")

col1, col2, col3, col4, col5 = st.columns(5)

col1.metric("🏆 Maior UrbanScore", f"{df_ranking['UrbanScore'].max():.2f}")

col2.metric("📍 Distritos analisados", len(df_ranking))

col3.metric("👥 População total", f"{int(df_ranking['populacao'].sum()):,}")

col4.metric("📊 Densidade média", f"{df_ranking['dens_demog'].mean():,.0f}")

col5.metric("👥 Idade média", f"{df_ranking['id_media'].mean():.1f}")

# =========================================================
# MODO EXECUTIVO: RESUMO E RECOMENDAÇÃO
# =========================================================
st.markdown("---")
st.header("📌 Resumo Executivo & Inteligência de Negócio")

top = df_ranking.iloc[0]

# Colunas para o Resumo e Composição do Score
exec_col1, exec_col2 = st.columns([1.5, 1])

with exec_col1:
    st.success(f"""
    ### 📍 Recomendação Estratégica: {top["nm_dist"]}
    
    O distrito de **{top["nm_dist"]}** foi identificado como a região de maior aderência para o segmento **{segmento_selecionado}**.
    
    **Narrativa de Decisão:**
    - O UrbanScore de **{top["UrbanScore"]:.2f}** indica uma alta compatibilidade territorial.
    - Apresenta uma robusta **Conectividade Metroferroviária** ({int(top["n_mob"])} integrações).
    - Possui uma **Densidade Demográfica** de {top["dens_demog"]:,.0f} hab/km².
    - A análise sugere um potencial estratégico elevado para implantação imediata, considerando o equilíbrio entre fluxo populacional e segurança relativa.
    """)

with exec_col2:
    st.subheader("🎯 Composição do Score")
    # Tabela de Pesos
    df_pesos = pd.DataFrame(
        [
            {"Variável": "Mobilidade", "Peso": f"{pesos['mob'] * 100:.0f}%"},
            {"Variável": "Densidade", "Peso": f"{pesos['dens'] * 100:.0f}%"},
            {"Variável": "População", "Peso": f"{pesos['pop'] * 100:.0f}%"},
            {"Variável": "Idade Média", "Peso": f"{pesos['idade'] * 100:.0f}%"},
            {
                "Variável": "Criminalidade",
                "Peso": f"{pesos['crime'] * 100:.0f}% (redutor)",
            },
        ]
    )
    st.table(df_pesos.set_index("Variável"))

# Seção de Explicabilidade (Contribuição Real)
with st.expander("🔍 Ver Detalhes da Explicabilidade (Contribuição Real no Distrito)"):
    exp_col1, exp_col2 = st.columns(2)

    with exp_col1:
        st.markdown(f"**Performance em {top['nm_dist']} (0 a 1):**")
        df_contrib = pd.DataFrame(
            [
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
        st.dataframe(df_contrib, hide_index=True, use_container_width=True)

    with exp_col2:
        st.info(f"""
        **Como o score foi construído?**
        
        O UrbanScore de **{top["nm_dist"]}** é o resultado da soma ponderada desses 5 indicadores. 
        A normalização garante que o distrito seja comparado com o melhor e o pior desempenho de toda a cidade de São Paulo dentro do segmento **{segmento_selecionado}**.
        """)

# =========================================================
# INSIGHTS AUTOMÁTICOS
# =========================================================
st.subheader("🔎 Insights Territoriais Adicionais")
bairro_mais_denso = df.loc[df["dens_demog"].idxmax()]
bairro_menos_denso = df.loc[df["dens_demog"].idxmin()]

ins_col1, ins_col2 = st.columns(2)
ins_col1.metric(
    "Distrito Mais Denso",
    bairro_mais_denso["nm_dist"],
    f"{bairro_mais_denso['dens_demog']:,.0f} hab/km²",
)
ins_col2.metric(
    "Distrito Menos Denso",
    bairro_menos_denso["nm_dist"],
    f"{bairro_menos_denso['dens_demog']:,.0f} hab/km²",
)

# =========================================================
# GRÁFICO PRINCIPAL
# =========================================================
st.subheader("📈 Ranking UrbanScore por Distrito")

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

st.plotly_chart(fig, use_container_width=True)

# =========================================================
# MAPA INTERATIVO
# =========================================================
st.subheader("🗺️ Distribuição Territorial do UrbanScore")

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
        "dens_demog": True,
        "id_media": True,
    },
    color_continuous_scale="Viridis",
    mapbox_style="carto-positron",
    center={"lat": -23.55, "lon": -46.63},
    zoom=9,
    opacity=0.75,
)

fig_map.update_layout(height=800, margin={"r": 0, "t": 0, "l": 0, "b": 0})

st.plotly_chart(fig_map, use_container_width=True)

# =========================================================
# NOVA SEÇÃO: INFRAESTRUTURA METROFERROVIÁRIA
# =========================================================
st.subheader("🚇 Infraestrutura Metroferroviária")

# KPIs de Mobilidade
m_col1, m_col2, m_col3, m_col4 = st.columns(4)
m_col1.metric("Total de Integrações", total_est)
m_col2.metric("Maior Conectividade", f"{top_dist} ({top_val})")
m_col3.metric("Pontos de Metrô", total_m)
m_col4.metric("Pontos de Trem", total_t)

st.info(
    "💡 **Nota sobre Conectividade:** A contagem de integrações reflete todos os pontos de acesso e conexões de linhas dentro do território do distrito. Distritos com estações de integração (ex: Ana Rosa, Santa Cruz) apresentam números maiores pois cada linha é contabilizada como um ponto de conectividade."
)

if not df_transporte.empty:
    fig_transp = px.scatter_mapbox(
        df_transporte,
        lat="latitude",
        lon="longitude",
        color="tipo",
        hover_name="estacao",
        hover_data={"tipo": True, "latitude": False, "longitude": False},
        color_discrete_map={"Metrô": "blue", "Trem": "red"},
        mapbox_style="carto-positron",
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

    st.plotly_chart(fig_transp, use_container_width=True)
else:
    st.info("Dados de infraestrutura metroferroviária não disponíveis.")

# =========================================================
# IDADE MÉDIA
# =========================================================
st.subheader("👥 Idade Média por Distrito")

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

st.plotly_chart(fig3, use_container_width=True)

# =========================================================
# SCATTER
# =========================================================
st.subheader("🏙️ Relação entre População e Densidade")

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

st.plotly_chart(fig4, use_container_width=True)

# =========================================================
# BASE CRIMINAL
# =========================================================
crime_file = "assets/01 - DADOS CRIMINAIS_JAN_2025_V2.xlsx"

try:
    df_crime = pd.read_excel(crime_file)

    # -----------------------------------------------------
    # PADRONIZA COLUNAS
    # -----------------------------------------------------
    df_crime.columns = df_crime.columns.astype(str).str.strip().str.lower()

    # -----------------------------------------------------
    # VALIDA COLUNA DP
    # -----------------------------------------------------
    if "dp" in df_crime.columns:
        # -------------------------------------------------
        # REMOVE PREFIXO "001 DP - "
        # -------------------------------------------------
        df_crime["nm_dist"] = (
            df_crime["dp"].astype(str).str.replace(r"^\d+\s*DP\s*-\s*", "", regex=True)
        )

        # -------------------------------------------------
        # NORMALIZA
        # -------------------------------------------------
        df_crime["nm_dist"] = df_crime["nm_dist"].apply(normalize_text)

        # -------------------------------------------------
        # AGRUPA
        # -------------------------------------------------
        df_crime_grouped = (
            df_crime.groupby("nm_dist")["2025"]
            .sum()
            .reset_index(name="total_ocorrencias")
        )

        # -------------------------------------------------
        # MERGE
        # -------------------------------------------------
        df_crime_merge = df.merge(df_crime_grouped, on="nm_dist", how="left")

        df_crime_merge["total_ocorrencias"] = df_crime_merge[
            "total_ocorrencias"
        ].fillna(0)

        # =================================================
        # GRÁFICO CRIMINALIDADE
        # =================================================
        st.subheader("🚨 Ocorrências Criminais por Distrito (Janeiro/2025)")

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

        fig_crime.update_layout(
            height=max(700, top_n * 35),
            xaxis_title="Quantidade de Ocorrências",
            yaxis_title="Distrito",
            showlegend=False,
        )

        st.plotly_chart(fig_crime, use_container_width=True)

        # =========================================================
        # MAPA DE CRIMINALIDADE
        # =========================================================
        if "total_ocorrencias" in df_crime_merge.columns:
            st.subheader("🗺️ Distribuição Territorial da Criminalidade")

            # -----------------------------------------------------
            # NORMALIZA NOMES NO GEOJSON
            # -----------------------------------------------------
            for feature in geojson_data["features"]:
                feature["properties"]["ds_nome"] = normalize_text(
                    feature["properties"]["ds_nome"]
                )

            # -----------------------------------------------------
            # MERGE CORRIGIDO
            # -----------------------------------------------------
            df_crime_map = df_crime_merge.copy()

            df_crime_map["feature_name"] = df_crime_map["nm_dist"]

            # -----------------------------------------------------
            # MAPA
            # -----------------------------------------------------
            fig_crime_map = px.choropleth_mapbox(
                df_crime_map,
                geojson=geojson_data,
                locations="feature_name",
                featureidkey="properties.ds_nome",
                color="total_ocorrencias",
                hover_name="nm_dist",
                hover_data={
                    "total_ocorrencias": True,
                    "UrbanScore": True,
                    "populacao": True,
                },
                color_continuous_scale="Reds",
                mapbox_style="carto-positron",
                center={"lat": -23.55, "lon": -46.63},
                zoom=9,
                opacity=0.75,
            )

            fig_crime_map.update_layout(
                height=800, margin={"r": 0, "t": 0, "l": 0, "b": 0}
            )

            st.plotly_chart(fig_crime_map, use_container_width=True)
        # =================================================
        # INSIGHT CRIMINAL
        # =================================================
        if not df_crime_chart.empty:
            distrito_mais_ocorrencias = df_crime_chart.iloc[0]

            st.warning(f"""
            ### 🚨 Estudo Exploratório de Criminalidade

            - Distrito com maior número de ocorrências:
              **{distrito_mais_ocorrencias["nm_dist"]}**

            - Total de ocorrências:
              **{int(distrito_mais_ocorrencias["total_ocorrencias"])}**

            ⚠️ Dados referentes apenas ao mês de janeiro de 2025.

            A associação entre DPs e distritos administrativos
            foi realizada por aproximação nominal.
            """)

except Exception as e:
    st.warning(f"""
    Não foi possível carregar a base criminal.

    Erro:
    {e}
    """)


# =========================================================
# TABELA
# =========================================================
st.subheader("📋 Dados Consolidados")

st.dataframe(
    df_ranking[
        ["nm_dist", "populacao", "dens_demog", "id_media", "UrbanScore"]
    ].sort_values(by="UrbanScore", ascending=False),
    use_container_width=True,
)

# =========================================================
# IMPACTO SOCIAL E ECONÔMICO
# =========================================================
st.markdown("""
---

# 🌍 Impacto Social e Econômico da Urbanis

A Urbanis propõe uma abordagem orientada a dados para apoiar análises urbanas e territoriais no município de São Paulo.

A plataforma integra indicadores demográficos, espaciais e exploratórios de segurança pública para permitir interpretações mais amplas sobre dinâmicas urbanas, distribuição populacional e concentração territorial de ocorrências.

Por meio da combinação entre visualização geográfica e análise estatística, o projeto busca transformar dados públicos em informações acessíveis para apoio exploratório à tomada de decisão.

## Impacto Social

- democratização do acesso a dados urbanos públicos
- facilitação da interpretação territorial de indicadores sociais
- apoio à visualização espacial de desigualdades urbanas
- exploração de padrões territoriais relacionados à segurança pública
- incentivo à cultura de dados e transparência urbana

A integração exploratória de ocorrências criminais permite observar como diferentes regiões apresentam dinâmicas urbanas distintas, possibilitando análises espaciais complementares sobre infraestrutura, densidade populacional e concentração de registros policiais.

## Impacto Econômico

- apoio exploratório para estudos territoriais
- suporte inicial para análise de expansão urbana
- identificação de regiões com alta concentração populacional
- visualização espacial de áreas com maior incidência de ocorrências registradas
- auxílio preliminar para análises de localização e inteligência territorial

A análise integrada entre densidade demográfica, UrbanScore e ocorrências criminais possibilita compreender padrões urbanos que podem influenciar estudos acadêmicos, planejamento territorial e avaliações exploratórias de regiões urbanas.

## Aplicação prática

A Urbanis pode ser utilizada como ferramenta acadêmica e exploratória para:

- análise territorial urbana
- estudos espaciais exploratórios
- visualização geográfica de indicadores públicos
- apoio inicial à interpretação de dados urbanos
- experimentação em projetos de Big Data e Ciência de Dados

## Segurança Pública e Territorialidade

O módulo de criminalidade incorporado ao projeto utiliza dados públicos da SSP-SP referentes ao mês de janeiro de 2025.

Os registros foram associados aos distritos administrativos por aproximação nominal entre Delegacias de Polícia (DPs) e distritos territoriais.

O objetivo do módulo não é realizar previsão criminal ou classificação de risco, mas permitir visualizações exploratórias sobre distribuição espacial de ocorrências no território urbano.

---
""")

# =========================================================
# METODOLOGIA
# =========================================================
st.markdown("""
# 📘 Metodologia

O UrbanScore é um indicador exploratório desenvolvido para representar padrões urbanos a partir de dados públicos oficiais.

## Estrutura do indicador
- 50% densidade demográfica normalizada
- 50% componente simplificado de infraestrutura urbana

## Objetivo
Demonstrar como técnicas de Big Data e análise de dados podem apoiar interpretações territoriais e visualizações urbanas.

## Tecnologias utilizadas
- Python
- Streamlit
- Plotly
- Pandas

## Fontes de Dados
- IBGE — Censo Demográfico
- SEADE — Indicadores Distritais do Município de São Paulo
- GeoSampa — Limites territoriais dos distritos
- SSP-SP — Ocorrências Criminais (jan/2025)

## Próximas expansões planejadas
- renda média por distrito
- indicadores históricos de segurança pública
- mobilidade urbana
- análise multicritério
- score segmentado por atividade econômica

## Limitações
Este modelo:
- não possui finalidade preditiva
- não representa índice oficial
- não considera renda ou atividade econômica
- utiliza abordagem exploratória simplificada
- utiliza aproximação entre DPs e distritos administrativos

## Natureza da análise
- exploratória
- descritiva
- acadêmica

---
""")
