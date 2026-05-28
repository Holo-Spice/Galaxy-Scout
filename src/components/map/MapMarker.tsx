"use client";

export function LocationMarker({
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

export function DepartureMarker({ x, y }: { x: number; y: number }) {
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
