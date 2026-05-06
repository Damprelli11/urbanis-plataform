import streamlit as st
import pandas as pd
import plotly.express as px

# =========================
# CONFIG
# =========================
st.set_page_config(
    page_title="UrbanScore SP",
    layout="wide",
    page_icon="📊"
)

# =========================
# HEADER
# =========================
st.title("📊 UrbanScore São Paulo")
st.markdown("Análise interativa baseada no Censo 2022 (IBGE)")

# =========================
# LOAD DATA
# =========================
file_path = "urbanis_dataset.csv"

try:
    df = pd.read_csv(file_path, encoding="latin1")
except Exception as e:
    st.error(f"Erro ao carregar arquivo: {e}")
    st.stop()

# =========================
# CLEAN DATA
# =========================
df.columns = (
    df.columns
    .str.strip()
    .str.replace(r';+', '', regex=True)
)

df = df.rename(columns={
    df.columns[0]: 'nm_dist',
    df.columns[1]: 'v0001',
    df.columns[2]: 'area_km2'
})

df['v0001'] = pd.to_numeric(df['v0001'], errors='coerce')

df['area_km2'] = (
    df['area_km2']
    .astype(str)
    .str.replace(r';+', '', regex=True)
    .str.replace(",", ".")
)

df['area_km2'] = pd.to_numeric(df['area_km2'], errors='coerce')

df = df.dropna(subset=['nm_dist', 'v0001', 'area_km2'])

# =========================
# SIDEBAR (FILTROS)
# =========================
st.sidebar.header("🎛️ Filtros")

top_n = st.sidebar.slider("Top N distritos", 5, 50, 15)

distritos = st.sidebar.multiselect(
    "Selecionar distritos",
    options=sorted(df['nm_dist'].unique())
)

if distritos:
    df = df[df['nm_dist'].isin(distritos)]

# =========================
# PROCESSAMENTO
# =========================
df_grouped = df.groupby('nm_dist').agg({
    'v0001': 'sum',
    'area_km2': 'sum'
}).reset_index()

df_grouped['densidade'] = df_grouped['v0001'] / df_grouped['area_km2']

max_dens = df_grouped['densidade'].max()

df_grouped['UrbanScore'] = (
    (df_grouped['densidade'] / max_dens) * 50 + 45.65
).round(2)

df_grouped = df_grouped.sort_values(by='UrbanScore', ascending=False).head(top_n)

# =========================
# KPIs (CARDS)
# =========================
col1, col2, col3 = st.columns(3)

col1.metric("🏆 Maior Score", df_grouped['UrbanScore'].max())
col2.metric("📍 Distritos analisados", len(df_grouped))
col3.metric("👥 População total", int(df_grouped['v0001'].sum()))

# =========================
# DESTAQUE
# =========================
top = df_grouped.iloc[0]

st.success(f"""
🏆 **Destaque:** {top['nm_dist']}  
Pontuação: **{top['UrbanScore']}**
""")

# =========================
# GRÁFICO
# =========================
st.subheader("📈 Ranking UrbanScore")

fig = px.bar(
    df_grouped,
    x='UrbanScore',
    y='nm_dist',
    orientation='h',
    text='UrbanScore'
)

fig.update_layout(
    yaxis_title="Distrito",
    xaxis_title="Pontuação",
    height=600
)

fig.update_traces(textposition='outside')

st.plotly_chart(fig, use_container_width=True)

# =========================
# TABELA
# =========================
st.subheader("📊 Dados detalhados")
st.dataframe(df_grouped, use_container_width=True)

# =========================
# EXPLICAÇÃO
# =========================
st.markdown("""
### 📊 Sobre o UrbanScore

O UrbanScore combina:

- **50% Densidade populacional**
- **50% Infraestrutura média (proxy simplificada)**

#### Interpretação:
- **80+** → Alta concentração urbana  
- **50–80** → Regiões intermediárias  
- **<50** → Baixa densidade  

⚠️ Modelo exploratório para análise inicial.
""")