"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { LightPollutionLayer } from "@/components/map/LightPollutionLayer";
import { LightPollutionControls } from "@/components/map/LightPollutionControls";

interface ApiLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  personal_rating: number | null;
}

interface MapLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

export default function MapPage() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const [locations, setLocations] = useState<MapLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDetail, setShowDetail] = useState(true);
  const [lpVisible, setLpVisible] = useState(false);
  const [lpOpacity, setLpOpacity] = useState(0.7);
  const [mapReady, setMapReady] = useState(false);

  const toggleLpVisibility = useCallback(() => {
    setLpVisible((prev) => !prev);
  }, []);

  const handleLpOpacityChange = useCallback((opacity: number) => {
    setLpOpacity(opacity);
  }, []);

  // Init MapLibre
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          "osm-tiles": {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          },
        },
        layers: [
          {
            id: "osm-tiles-layer",
            type: "raster",
            source: "osm-tiles",
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: [106, 36],
      zoom: 5,
      attributionControl: true,
    });

    map.on("load", () => {
      setMapReady(true);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Fetch locations
  useEffect(() => {
    fetch("/api/locations")
      .then((res) => res.json())
      .then((json) => {
        if (json.error) return;
        const locs = (json.data as ApiLocation[]).map((l) => ({
          id: l.id,
          name: l.name,
          latitude: l.latitude,
          longitude: l.longitude,
        }));
        setLocations(locs);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Add/update markers when locations or map changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Add new markers
    locations.forEach((loc) => {
      const el = document.createElement("div");
      el.className = "map-marker";
      el.innerHTML = `<div style="
        width:12px;height:12px;background:#6366f1;border:2px solid white;
        border-radius:50%;box-shadow:0 1px 3px rgba(0,0,0,0.3);cursor:pointer;
      " title="${loc.name}"></div>`;
      el.addEventListener("click", () => {
        new maplibregl.Popup({ offset: 14 })
          .setLngLat([loc.longitude, loc.latitude])
          .setHTML(`<strong>${loc.name}</strong><br/>${loc.latitude.toFixed(2)}°, ${loc.longitude.toFixed(2)}°`)
          .addTo(map);
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([loc.longitude, loc.latitude])
        .addTo(map);
      markersRef.current.push(marker);
    });

    // Fit bounds if locations exist
    if (locations.length > 0) {
      const bounds = new maplibregl.LngLatBounds();
      locations.forEach((l) => bounds.extend([l.longitude, l.latitude]));
      map.fitBounds(bounds, { padding: 60, maxZoom: 10 });
    }
  }, [locations, mapReady]);


  return (
    <div className="-m-6 h-screen flex flex-col md:flex-row overflow-hidden">
      {/* Map area */}
      <div className="relative flex-1 min-h-0 bg-canvas">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none bg-canvas/50">
            <span className="text-[13px] text-ink-subtle">加载地点中…</span>
          </div>
        )}

        <div ref={mapContainer} className="absolute inset-0" />

        {/* Search */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 w-[min(480px,calc(100%-2rem))]">
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-subtle pointer-events-none">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <circle cx="7" cy="7" r="5" />
                <path d="M11 11l3.5 3.5" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="搜索观测地点…"
              className="w-full bg-surface-1/95 backdrop-blur-sm border border-hairline rounded pl-10 pr-4 py-2.5 text-[14px] text-ink placeholder:text-ink-tertiary focus:border-accent focus:ring-1 focus:ring-accent-muted outline-none transition-all duration-150"
            />
          </div>
        </div>

        {/* Light pollution controls */}
        <LightPollutionControls
          visible={lpVisible}
          opacity={lpOpacity}
          onToggleVisibility={toggleLpVisibility}
          onOpacityChange={handleLpOpacityChange}
        />

        {/* Light pollution layer */}
        {mapReady && mapRef.current && (
          <LightPollutionLayer
            map={mapRef.current}
            visible={lpVisible}
            opacity={lpOpacity}
          />
        )}
      </div>

      {/* Sidebar */}
      {showDetail && (
        <div className="w-full md:w-[380px] shrink-0 bg-surface-1 border-t md:border-t-0 md:border-l border-hairline overflow-y-auto">
          <div className="sticky top-0 bg-surface-1 z-10 px-4 py-3 border-b border-hairline flex items-center justify-between">
            <span className="text-[14px] font-medium text-ink">
              观测地点 · {locations.length}
            </span>
            <button
              onClick={() => setShowDetail(false)}
              className="p-1 rounded hover:bg-surface-2 text-ink-subtle"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 4l8 8M12 4l-8 8" />
              </svg>
            </button>
          </div>

          {locations.map((loc) => (
            <div
              key={loc.id}
              className="px-4 py-3 border-b border-hairline hover:bg-surface-2 cursor-pointer transition-colors"
              onClick={() => {
                mapRef.current?.flyTo({
                  center: [loc.longitude, loc.latitude],
                  zoom: 12,
                  duration: 1000,
                });
              }}
            >
              <div className="text-[14px] font-medium text-ink">{loc.name}</div>
              <div className="text-[12px] text-ink-subtle mt-0.5 font-mono">
                {loc.latitude.toFixed(4)}°, {loc.longitude.toFixed(4)}°
              </div>
            </div>
          ))}
        </div>
      )}

      {!showDetail && (
        <button
          onClick={() => setShowDetail(true)}
          className="absolute top-4 right-4 z-20 bg-surface-1 border border-hairline rounded px-3 py-2 text-[13px] text-ink-subtle hover:text-ink shadow-sm"
        >
          地点列表 · {locations.length}
        </button>
      )}
    </div>
  );
}
