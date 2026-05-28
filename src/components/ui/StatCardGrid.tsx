"use client";

export interface StatItem {
  label: string;
  value: string | number;
  colorClass?: string;
}

interface StatCardGridProps {
  stats: StatItem[];
  columns?: number;
  compact?: boolean;
  className?: string;
}

export function StatCardGrid({
  stats,
  columns = 4,
  compact = false,
  className,
}: StatCardGridProps) {
  return (
    <div
      className={`grid ${compact ? "gap-3" : "gap-4"} ${className ?? ""}`}
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
    >
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={
            compact
              ? ""
              : "bg-surface-1 rounded-xl border border-hairline p-4"
          }
        >
          <span
            className={`${compact ? "text-[10px]" : "text-[11px] mb-1"} text-ink-subtle block`}
          >
            {stat.label}
          </span>
          <span
            className={`${compact ? "text-[12px]" : "text-[24px] font-bold"} font-mono ${stat.colorClass ?? (compact ? "text-ink-muted" : "text-ink")}`}
          >
            {stat.value}
          </span>
        </div>
      ))}
    </div>
  );
}
