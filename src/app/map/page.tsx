"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { LightPollutionControls } from "@/components/map/LightPollutionControls";

export default function MapPage() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [lpVisible, setLpVisible] = useState(false);
  const [lpOpacity, setLpOpacity] = useState(0.7);
  const [error, setError] = useState<string | null>(null);
  const [LightPollutionLayerComp, setLightPollutionLayerComp] = useState<any>(null);

  // Init MapLibre - dynamic import to avoid SSR issues
  useEffect(() => {
    let map: any = null;
    let cancelled = false;

    async function init() {
      try {
        const maplibregl = (await import("maplibre-gl")).default;
        await import("maplibre-gl/dist/maplibre-gl.css");

        if (cancelled || !mapContainer.current) return;

        map = new maplibregl.Map({
          container: mapContainer.current,
          style: {
          version: 8,
          glyphs: "https://fonts.openmaptiles.org/{fontstack}/{range}.pbf",
          sources: {
            "osm-raster": {
              type: "raster",
              tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
              tileSize: 256,
              attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>',
            },
          },
          layers: [
            {
              id: "osm-raster-layer",
              type: "raster",
              source: "osm-raster",
              minzoom: 0,
              maxzoom: 19,
            },
          ],
        },
          center: [106, 36],
          zoom: 5,
        });

        map.on("load", () => {
          if (!cancelled) setMapReady(true);
        });

        mapRef.current = map;
      } catch (err: any) {
        console.error("MapLibre init failed:", err);
        if (!cancelled) setError(err.message || "地图加载失败");
      }
    }

    init();

    return () => {
      cancelled = true;
      if (map) { map.remove(); mapRef.current = null; }
    };
  }, []);

  // Load light pollution layer component (dynamic)
  useEffect(() => {
    if (!mapReady) return;
    import("@/components/map/LightPollutionLayer").then((mod) => {
      setLightPollutionLayerComp(() => mod.LightPollutionLayer);
    });
  }, [mapReady]);

  // Fetch locations
  useEffect(() => {
    fetch("/api/locations")
      .then((r) => r.json())
      .then((json) => {
        if (json.error) return;
        setLocations(
          (json.data as any[]).map((l) => ({
            id: l.id, name: l.name,
            latitude: l.latitude, longitude: l.longitude,
          }))
        );
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Add markers when locations + map ready
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady || locations.length === 0) return;

    markersRef.current.forEach((m: any) => m.remove());
    markersRef.current = [];

    // maplibregl is on window after dynamic import
    import("maplibre-gl").then(({ default: maplibregl }) => {
      locations.forEach((loc: any) => {
        const el = document.createElement("div");
        el.innerHTML = `<div style="width:14px;height:14px;background:#6366f1;border:2px solid #fff;border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,.5);cursor:pointer" title="${loc.name}"></div>`;
        el.addEventListener("click", () => {
          new maplibregl.Popup({ offset: 16 })
            .setLngLat([loc.longitude, loc.latitude])
            .setHTML(`<strong>${loc.name}</strong>`)
            .addTo(map);
        });
        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([loc.longitude, loc.latitude])
          .addTo(map);
        markersRef.current.push(marker);
      });

      if (locations.length > 0) {
        const bounds = new maplibregl.LngLatBounds();
        locations.forEach((l: any) => bounds.extend([l.longitude, l.latitude]));
        map.fitBounds(bounds, { padding: 60, maxZoom: 10 });
      }
    });
  }, [locations, mapReady]);

  const toggleLpVisibility = useCallback(() => setLpVisible((p) => !p), []);
  const handleLpOpacityChange = useCallback((o: number) => setLpOpacity(o), []);

  return (
    <div className="-m-6 h-screen flex flex-col md:flex-row overflow-hidden">
      {/* Map area */}
      <div className="relative flex-1 min-h-0">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none" style={{background:"rgba(10,11,15,0.5)"}}>
            <span className="text-[14px] text-ink-muted">加载地点中…</span>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center z-30" style={{background:"#0a0b0f"}}>
            <div className="text-center px-6">
              <p className="text-[16px] text-red-400 mb-2">地图加载失败</p>
              <p className="text-[13px] text-ink-subtle">{error}</p>
            </div>
          </div>
        )}

        <div ref={mapContainer} style={{ width:"100%", height:"100%", position:"absolute", top:0, left:0 }} />

        {/* Search bar */}
        <div className="absolute top-4 left-1/2 z-10 w-[min(480px,calc(100%-2rem))]" style={{transform:"translateX(-50%)"}}>
          <input
            type="text"
            placeholder="搜索观测地点…"
            className="w-full bg-surface-1/95 backdrop-blur-sm border border-hairline rounded pl-4 pr-4 py-2.5 text-[14px] text-ink placeholder:text-ink-tertiary focus:border-accent outline-none"
          />
        </div>

        <LightPollutionControls
          visible={lpVisible}
          opacity={lpOpacity}
          onToggleVisibility={toggleLpVisibility}
          onOpacityChange={handleLpOpacityChange}
        />

        {mapReady && mapRef.current && LightPollutionLayerComp && (
          <LightPollutionLayerComp map={mapRef.current} visible={lpVisible} opacity={lpOpacity} />
        )}
      </div>

      {/* Sidebar */}
      <div className="w-full md:w-[380px] shrink-0 bg-surface-1 border-t md:border-t-0 md:border-l border-hairline overflow-y-auto">
        <div className="sticky top-0 bg-surface-1 z-10 px-4 py-3 border-b border-hairline">
          <span className="text-[14px] font-medium text-ink">
            观测地点 · {locations.length}
          </span>
        </div>
        {locations.map((loc: any) => (
          <div
            key={loc.id}
            className="px-4 py-3 border-b border-hairline hover:bg-surface-2 cursor-pointer transition-colors"
            onClick={() => {
              mapRef.current?.flyTo({ center: [loc.longitude, loc.latitude], zoom: 12, duration: 1000 });
            }}
          >
            <div className="text-[14px] font-medium text-ink">{loc.name}</div>
            <div className="text-[12px] text-ink-subtle mt-0.5 font-mono">
              {loc.latitude.toFixed(4)}°, {loc.longitude.toFixed(4)}°
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
