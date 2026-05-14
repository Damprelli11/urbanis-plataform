import React, { useEffect, useState, useMemo } from "react";
import { useUrbanStore } from "@/store/useUrbanStore";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import L from "leaflet";

// Fix for default Leaflet icon issue in React
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

export function ChoroplethMap() {
  const { districts } = useUrbanStore();
  const [geoData, setGeoData] = useState<any>(null);

  useEffect(() => {
    fetch("/distritos-sp.geojson")
      .then((res) => res.json())
      .then((data) => setGeoData(data))
      .catch((err) => console.error("Erro ao carregar GeoJSON", err));
  }, []);

  const districtMap = useMemo(() => {
    const map = new Map();
    districts.forEach(d => map.set(d.nm_dist.toUpperCase(), d));
    districts.forEach(d => map.set(d.nm_dist, d));
    return map;
  }, [districts]);

  const getColor = (score: number | undefined) => {
    if (score === undefined || score === null) return "#334155";
    
    const t = Math.max(0, Math.min(100, score)) / 100;
    const r = Math.round(51 + t * (192 - 51));
    const g = Math.round(65 + t * (25 - 65));
    const b = Math.round(85 + t * (43 - 85));
    
    return `rgb(${r}, ${g}, ${b})`;
  };

  const mapStyle = (feature: any) => {
    const districtName = feature.properties.ds_nome || feature.properties.NOME_DIST || "";
    const dData = districtMap.get(districtName.toUpperCase()) || districtMap.get(districtName);
    const score = dData?.UrbanScore;

    return {
      fillColor: getColor(score),
      weight: 1,
      opacity: 1,
      color: "rgba(255,255,255,0.2)",
      fillOpacity: 0.8,
    };
  };

  const onEachFeature = (feature: any, layer: any) => {
    const districtName = feature.properties.ds_nome || feature.properties.NOME_DIST || "";
    const dData = districtMap.get(districtName.toUpperCase()) || districtMap.get(districtName);
    const score = dData?.UrbanScore;

    if (dData) {
      layer.bindTooltip(
        `<div style="font-family: 'DM Mono', monospace; font-size: 11px;">
          <b style="font-size: 12px; color: #fff">${dData.nm_dist}</b><br/>
          <span style="color: #94a3b8">SCORE:</span> <b style="color: #C0192B">${score?.toFixed(1)}</b><br/>
          <span style="color: #94a3b8">POP:</span> ${dData.populacao?.toLocaleString('pt-BR')}
        </div>`,
        { sticky: true, className: 'leaflet-custom-tooltip' }
      );
    }

    layer.on({
      mouseover: (e: any) => {
        const l = e.target;
        l.setStyle({
          fillOpacity: 1,
          weight: 2,
          color: "#C0192B",
        });
      },
      mouseout: (e: any) => {
        const l = e.target;
        l.setStyle({
          fillOpacity: 0.8,
          weight: 1,
          color: "rgba(255,255,255,0.2)",
        });
      },
    });
  };

  if (!geoData) return null;

  return (
    <div className="w-full h-full relative group">
      <MapContainer
        center={[-23.5505, -46.6333]}
        zoom={11}
        style={{ width: "100%", height: "100%", background: "#101113" }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <GeoJSON
          data={geoData}
          style={mapStyle}
          onEachFeature={onEachFeature}
        />
      </MapContainer>
      
      {/* Map Legend */}
      <div className="absolute bottom-6 right-6 bg-[#16181B] p-5 rounded-lg border border-white/10 z-[1000] min-w-[140px] transition-fast group-hover:border-primary/50">
        <p className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest mb-4">Densidade UrbanScore</p>
        <div className="flex flex-col gap-3">
          <div className="space-y-1.5">
            <div className="h-2 w-full rounded-full" style={{background: "linear-gradient(to right, #334155, #C0192B)"}}></div>
            <div className="flex justify-between text-[9px] font-mono font-bold text-muted-foreground">
              <span>0.0</span>
              <span>100.0</span>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-2 border-t border-white/5">
            <div className="w-2.5 h-2.5 bg-[#334155] rounded-sm"></div>
            <span className="text-[9px] font-mono text-muted-foreground uppercase font-bold">Fora do Escopo</span>
          </div>
        </div>
      </div>

      {/* Floating Controls Placeholder */}
      <div className="absolute top-6 left-6 z-[1000] flex flex-col gap-2">
        <div className="bg-[#16181B] border border-white/10 p-1.5 rounded flex flex-col gap-1">
          <div className="w-6 h-6 flex items-center justify-center text-xs font-bold text-muted-foreground hover:text-white cursor-pointer">+</div>
          <div className="h-px bg-white/5 w-full"></div>
          <div className="w-6 h-6 flex items-center justify-center text-xs font-bold text-muted-foreground hover:text-white cursor-pointer">−</div>
        </div>
      </div>
    </div>
  );
}
