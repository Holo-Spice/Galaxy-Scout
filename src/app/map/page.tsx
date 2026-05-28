"use client";

import { useState } from "react";
import { LocationMarker, DepartureMarker } from "@/components/map/MapMarker";
import { LayerToggle, type Layer } from "@/components/map/LayerToggle";
import { LocationPanel } from "@/components/map/LocationPanel";

const MARKERS = [
  { id: 1, name: "天荒坪", x: 32, y: 38, type: "location" as const, score: 92, bortle: 2 },
  { id: 2, name: "茶山", x: 58, y: 52, type: "location" as const, score: 87, bortle: 3 },
  { id: 3, name: "坝上", x: 75, y: 28, type: "location" as const, score: 78, bortle: 4 },
  { id: 4, name: "出发点", x: 45, y: 70, type: "departure" as const },
];

const INITIAL_LAYERS: Layer[] = [
  { id: "viirs", label: "VIIRS 辐亮度", active: true },
  { id: "clouds", label: "云量预报", active: false },
  { id: "roads", label: "路网", active: false },
];

export default function MapPage() {
  const [showDetail, setShowDetail] = useState(true);
  const [layers, setLayers] = useState(INITIAL_LAYERS);
  const [showLayerPanel, setShowLayerPanel] = useState(false);

  const toggleLayer = (id: string) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, active: !l.active } : l))
    );
  };

  return (
    <div className="-m-6 h-screen flex flex-col md:flex-row overflow-hidden">
      <div className="relative flex-1 min-h-0 bg-canvas">
        <div className="absolute inset-0 bg-canvas" />

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <div className="flex flex-col items-center gap-2 opacity-30">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-ink-subtle">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
            <span className="text-[13px] text-ink-subtle font-mono">
              MapLibre GL JS · 等待底图配置
            </span>
          </div>
        </div>

        {MARKERS.map((m) =>
          m.type === "location" ? (
            <LocationMarker
              key={m.id}
              name={m.name}
              x={m.x}
              y={m.y}
              score={m.score!}
              bortle={m.bortle!}
            />
          ) : (
            <DepartureMarker key={m.id} x={m.x} y={m.y} />
          )
        )}

        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 w-[min(480px,calc(100%-2rem))]">
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-subtle pointer-events-none">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <circle cx="7" cy="7" r="5" />
                <path d="M11 11l3.5 3.5" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="搜索观测地点..."
              className="w-full bg-surface-1/95 backdrop-blur-sm border border-hairline rounded pl-10 pr-4 py-2.5 text-[14px] text-ink placeholder:text-ink-tertiary focus:border-accent focus:ring-1 focus:ring-accent-muted outline-none transition-all duration-150"
            />
          </div>
        </div>

        <LayerToggle
          layers={layers}
          showLayerPanel={showLayerPanel}
          onToggleLayer={toggleLayer}
          onTogglePanel={() => setShowLayerPanel(!showLayerPanel)}
        />

        <div className="absolute bottom-4 right-4 z-20">
          <div className="bg-surface-1/95 backdrop-blur-sm border border-hairline rounded px-3 py-2 flex items-center gap-3">
            <span className="text-[11px] text-ink-subtle font-mono">30.5°N 119.6°E</span>
            <div className="w-px h-3 bg-hairline" />
            <span className="text-[11px] text-ink-subtle font-mono">z10</span>
          </div>
        </div>
      </div>

      {showDetail && <LocationPanel onClose={() => setShowDetail(false)} />}

      {!showDetail && (
        <button
          onClick={() => setShowDetail(true)}
          className="hidden md:flex absolute top-4 right-4 z-20 items-center gap-2 px-3 py-2 rounded bg-surface-1/95 backdrop-blur-sm border border-hairline text-ink-muted hover:text-ink hover:border-hairline-strong transition-colors duration-150"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <rect x="1" y="1" width="14" height="14" rx="2" />
            <path d="M10 1v14" />
          </svg>
          <span className="text-[13px]">详情</span>
        </button>
      )}
    </div>
  );
}
