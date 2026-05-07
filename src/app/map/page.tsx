"use client";

import { useState } from "react";

const MARKERS = [
  { id: 1, name: "天荒坪", x: 32, y: 38, type: "location" as const, score: 92, bortle: 2 },
  { id: 2, name: "茶山", x: 58, y: 52, type: "location" as const, score: 87, bortle: 3 },
  { id: 3, name: "坝上", x: 75, y: 28, type: "location" as const, score: 78, bortle: 4 },
  { id: 4, name: "出发点", x: 45, y: 70, type: "departure" as const },
];

const DETAIL = {
  name: "天荒坪",
  coords: "30.4856° N, 119.5936° E",
  elevation: "1,087 m",
  bortle: "2",
  viirs: "0.42 mW/cm²·sr",
  sqm: "21.8 mag/arcsec²",
  status: "recommended" as const,
};

const LAYERS = [
  { id: "viirs", label: "VIIRS 辐亮度", active: true },
  { id: "clouds", label: "云量预报", active: false },
  { id: "roads", label: "路网", active: false },
];

function Starfield() {
  const stars = Array.from({ length: 80 }, (_, i) => ({
    id: i,
    x: ((i * 37 + 13) % 100),
    y: ((i * 53 + 7) % 100),
    size: i % 3 === 0 ? 2 : 1,
    opacity: 0.15 + (i % 5) * 0.08,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {stars.map((s) => (
        <div
          key={s.id}
          className="absolute rounded-full bg-ink"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            opacity: s.opacity,
          }}
        />
      ))}
    </div>
  );
}

function GridOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
      {Array.from({ length: 6 }, (_, i) => (
        <div
          key={`h-${i}`}
          className="absolute left-0 right-0 border-t border-hairline"
          style={{ top: `${(i + 1) * 14.28}%`, opacity: 0.4 }}
        />
      ))}
      {Array.from({ length: 8 }, (_, i) => (
        <div
          key={`v-${i}`}
          className="absolute top-0 bottom-0 border-l border-hairline"
          style={{ left: `${(i + 1) * 11.11}%`, opacity: 0.4 }}
        />
      ))}
      <div
        className="absolute border border-accent/10 rounded-full"
        style={{
          left: "38%",
          top: "58%",
          width: "24%",
          height: "32%",
          transform: "translate(-50%, -50%)",
        }}
      />
      <div
        className="absolute border border-accent/5 rounded-full"
        style={{
          left: "38%",
          top: "58%",
          width: "48%",
          height: "64%",
          transform: "translate(-50%, -50%)",
        }}
      />
    </div>
  );
}

function LocationMarker({
  name,
  x,
  y,
  score,
  bortle,
}: {
  name: string;
  x: number;
  y: number;
  score: number;
  bortle: number;
}) {
  return (
    <div
      className="absolute group -translate-x-1/2 -translate-y-1/2 cursor-pointer"
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      <div className="relative">
        <div className="w-3 h-3 rounded-full bg-accent border-2 border-white/90 shadow-[0_0_0_3px_rgba(110,120,255,0.2)] transition-transform duration-150 group-hover:scale-130" />
        <div className="absolute -inset-1 rounded-full border-2 border-accent/30 opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
      </div>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-10">
        <div className="bg-surface-2 border border-hairline-strong rounded px-3 py-2 whitespace-nowrap shadow-lg">
          <p className="text-[13px] font-medium text-ink">{name}</p>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-[11px] text-ink-subtle">Bortle {bortle}</span>
            <span className="text-[11px] font-mono text-accent">{score}分</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function DepartureMarker({ x, y }: { x: number; y: number }) {
  return (
    <div
      className="absolute group -translate-x-1/2 -translate-y-1/2 cursor-pointer"
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      <div className="w-3 h-3 bg-warning rotate-45 border-2 border-white/90 shadow-[0_0_0_3px_rgba(240,160,48,0.2)] transition-transform duration-150 group-hover:scale-130" />
      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none">
        <div className="bg-surface-2 border border-hairline-strong rounded px-3 py-1.5 whitespace-nowrap shadow-lg">
          <p className="text-[11px] font-medium text-warning">出发点</p>
        </div>
      </div>
    </div>
  );
}

const statusMap = {
  recommended: { label: "推荐", color: "text-success", bg: "bg-success-muted", dot: "bg-success" },
  watch: { label: "观望", color: "text-warning", bg: "bg-warning-muted", dot: "bg-warning" },
  not_recommended: { label: "不推荐", color: "text-danger", bg: "bg-danger-muted", dot: "bg-danger" },
} as const;

function StatusBadge({ status }: { status: keyof typeof statusMap }) {
  const s = statusMap[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${s.color} ${s.bg}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

function DetailPanel({ onClose }: { onClose: () => void }) {
  const rows = [
    { label: "坐标", value: DETAIL.coords, mono: true },
    { label: "海拔", value: DETAIL.elevation, mono: true },
    { label: "Bortle 等级", value: DETAIL.bortle, mono: true },
    { label: "VIIRS 辐亮度", value: DETAIL.viirs, mono: true },
    { label: "SQM 测量", value: DETAIL.sqm, mono: true },
  ];

  return (
    <aside className="flex flex-col bg-surface-1 border-l border-hairline w-[320px] shrink-0 overflow-y-auto">
      <div className="flex items-center justify-between px-5 py-4 border-b border-hairline">
        <div className="flex items-center gap-3">
          <h2 className="text-[18px] font-semibold text-ink tracking-[-0.3px]">
            {DETAIL.name}
          </h2>
          <StatusBadge status={DETAIL.status} />
        </div>
        <button
          onClick={onClose}
          className="flex items-center justify-center w-8 h-8 rounded text-ink-subtle hover:text-ink hover:bg-surface-2 transition-colors duration-150"
          aria-label="关闭详情面板"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M4 4l8 8M12 4l-8 8" />
          </svg>
        </button>
      </div>

      <div className="px-5 py-4 space-y-4">
        {rows.map((r) => (
          <div key={r.label} className="flex flex-col gap-1">
            <span className="text-[11px] font-medium text-ink-subtle tracking-[0.05px]">
              {r.label}
            </span>
            <span className={`text-[13px] text-ink ${r.mono ? "font-mono" : ""}`}>
              {r.value}
            </span>
          </div>
        ))}
      </div>

      <div className="mx-5 border-t border-hairline" />

      <div className="px-5 py-4 space-y-2">
        <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded bg-accent text-white text-[14px] font-medium hover:bg-accent-hover active:bg-accent-focus active:scale-[0.98] transition-all duration-150">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M8 1v14M1 8h14" />
          </svg>
          添加到候选
        </button>
        <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded border border-hairline text-ink text-[14px] font-medium hover:bg-surface-2 hover:border-hairline-strong transition-all duration-150">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M8 2C5.24 2 3 4.24 3 7c0 3.75 5 7 5 7s5-3.25 5-7c0-2.76-2.24-5-5-5z" />
            <circle cx="8" cy="7" r="1.5" />
          </svg>
          导航前往
        </button>
      </div>

      <div className="mt-auto px-5 py-3 border-t border-hairline">
        <p className="text-[11px] text-ink-subtle">
          数据来源: VIIRS 2025-04 · SQM 实测 2025-03
        </p>
      </div>
    </aside>
  );
}

export default function MapPage() {
  const [showDetail, setShowDetail] = useState(true);
  const [layers, setLayers] = useState(LAYERS);
  const [showLayerPanel, setShowLayerPanel] = useState(false);

  const toggleLayer = (id: string) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, active: !l.active } : l))
    );
  };

  return (
    <div className="-m-6 h-screen flex flex-col md:flex-row overflow-hidden">
      <div className="relative flex-1 min-h-0 bg-canvas">
        <div className="absolute inset-0 bg-canvas">
          <Starfield />
          <GridOverlay />
        </div>

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

        <div className="absolute bottom-4 left-4 z-20 flex flex-col gap-2">
          <div className="relative">
            <button
              onClick={() => setShowLayerPanel(!showLayerPanel)}
              className={`flex items-center justify-center w-10 h-10 rounded bg-surface-1/95 backdrop-blur-sm border transition-colors duration-150 ${
                showLayerPanel
                  ? "border-accent text-accent"
                  : "border-hairline text-ink-muted hover:text-ink hover:border-hairline-strong"
              }`}
              aria-label="图层"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 2L2 6l7 4 7-4-7-4z" />
                <path d="M2 10l7 4 7-4" />
                <path d="M2 14l7 4 7-4" />
              </svg>
            </button>

            {showLayerPanel && (
              <div className="absolute bottom-0 left-12 w-48 bg-surface-1/95 backdrop-blur-sm border border-hairline rounded shadow-lg overflow-hidden">
                <div className="px-3 py-2 border-b border-hairline">
                  <span className="text-[11px] font-medium text-ink-subtle">图层控制</span>
                </div>
                {layers.map((layer) => (
                  <button
                    key={layer.id}
                    onClick={() => toggleLayer(layer.id)}
                    className="flex items-center gap-3 w-full px-3 py-2.5 text-left hover:bg-surface-2 transition-colors duration-150"
                  >
                    <div
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors duration-150 ${
                        layer.active
                          ? "bg-accent border-accent"
                          : "border-hairline-strong bg-transparent"
                      }`}
                    >
                      {layer.active && (
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                          <path d="M2 5l2.5 2.5L8 3" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-[13px] ${layer.active ? "text-ink" : "text-ink-muted"}`}>
                      {layer.label}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="w-10 flex justify-center">
            <div className="w-5 border-t border-hairline" />
          </div>

          <button
            className="flex items-center justify-center w-10 h-10 rounded bg-surface-1/95 backdrop-blur-sm border border-hairline text-ink-muted hover:text-ink hover:border-hairline-strong transition-colors duration-150"
            aria-label="放大"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M8 3v10M3 8h10" />
            </svg>
          </button>
          <button
            className="flex items-center justify-center w-10 h-10 rounded bg-surface-1/95 backdrop-blur-sm border border-hairline text-ink-muted hover:text-ink hover:border-hairline-strong transition-colors duration-150"
            aria-label="缩小"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M3 8h10" />
            </svg>
          </button>

          <button
            className="flex items-center justify-center w-10 h-10 rounded bg-surface-1/95 backdrop-blur-sm border border-hairline text-ink-muted hover:text-ink hover:border-hairline-strong transition-colors duration-150"
            aria-label="定位"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="8" cy="8" r="3" />
              <path d="M8 1v3M8 12v3M1 8h3M12 8h3" />
            </svg>
          </button>
        </div>

        <div className="absolute bottom-4 right-4 z-20">
          <div className="bg-surface-1/95 backdrop-blur-sm border border-hairline rounded px-3 py-2 flex items-center gap-3">
            <span className="text-[11px] text-ink-subtle font-mono">30.5°N 119.6°E</span>
            <div className="w-px h-3 bg-hairline" />
            <span className="text-[11px] text-ink-subtle font-mono">z10</span>
          </div>
        </div>
      </div>

      {showDetail && <DetailPanel onClose={() => setShowDetail(false)} />}

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
