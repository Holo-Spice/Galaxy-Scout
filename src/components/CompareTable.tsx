"use client";

import clsx from "clsx";

type LocationStatus = "recommended" | "watch" | "not_recommended" | "unknown";

interface Location {
  id: string;
  name: string;
  tags: string[];
  coverImage: string;
  coordinates: string;
  elevation: string;
  bortle: number;
  viirs: number;
  status: LocationStatus | (string & {});
  bestHour: string;
  score: number;
  distance: string;
  cloudCover: number;
  precipitation: number;
  moonPhase: string;
}

interface CompareTableProps {
  locations: Location[];
}

const statusConfig: Record<
  LocationStatus,
  { label: string; color: string; bg: string }
> = {
  recommended: {
    label: "推荐",
    color: "text-success",
    bg: "bg-success-muted",
  },
  watch: {
    label: "观望",
    color: "text-warning",
    bg: "bg-warning-muted",
  },
  not_recommended: {
    label: "不推荐",
    color: "text-danger",
    bg: "bg-danger-muted",
  },
  unknown: {
    label: "未知",
    color: "text-ink-subtle",
    bg: "bg-surface-2",
  },
};

function getRiskTags(loc: Location): string[] {
  const risks: string[] = [];
  if (loc.bortle >= 5) risks.push("光害严重");
  else if (loc.bortle >= 3) risks.push("光害中等");
  if (loc.cloudCover >= 50) risks.push("多云");
  else if (loc.cloudCover >= 30) risks.push("有云");
  if (loc.precipitation >= 30) risks.push("降水风险");
  else if (loc.precipitation >= 10) risks.push("少量降水");
  if (loc.moonPhase !== "新月") risks.push("月光干扰");
  const distNum = parseInt(loc.distance);
  if (distNum >= 300) risks.push("路途遥远");
  if (loc.bestHour === "N/A") risks.push("无观测窗口");
  return risks;
}

function bestScore(locations: Location[]): number {
  return Math.max(...locations.map((l) => l.score));
}

function bestBortle(locations: Location[]): number {
  return Math.min(...locations.map((l) => l.bortle));
}

function bestViirs(locations: Location[]): number {
  return Math.min(...locations.map((l) => l.viirs));
}

function bestCloud(locations: Location[]): number {
  return Math.min(...locations.map((l) => l.cloudCover));
}

function parseDistance(d: string): number {
  return parseInt(d) || 0;
}

function bestDistance(locations: Location[]): number {
  return Math.min(...locations.map((l) => parseDistance(l.distance)));
}

function StatusBadge({ status }: { status: Location["status"] }) {
  const cfg =
    statusConfig[status as LocationStatus] ?? statusConfig.unknown;
  return (
    <span
      className={clsx(
        "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium tracking-wide",
        cfg.bg,
        cfg.color
      )}
    >
      {cfg.label}
    </span>
  );
}

function RiskTag({ label }: { label: string }) {
  const isHigh =
    label.includes("严重") || label.includes("多云") || label.includes("降水风险");
  return (
    <span
      className={clsx(
        "inline-flex items-center px-1.5 py-px rounded text-[10px] font-medium tracking-wide whitespace-nowrap",
        isHigh
          ? "bg-danger-muted text-danger"
          : "bg-warning-muted text-warning"
      )}
    >
      {label}
    </span>
  );
}

function CellHighlight({
  isBest,
  children,
}: {
  isBest: boolean;
  children: React.ReactNode;
}) {
  return (
    <td
      className={clsx(
        "px-3 py-2.5 text-center font-mono text-[13px] leading-tight border-r border-hairline last:border-r-0 transition-colors",
        isBest ? "bg-accent-muted text-accent data-[theme=supabase]:bg-emerald-500/15 data-[theme=supabase]:text-emerald-400" : "text-ink"
      )}
    >
      {children}
    </td>
  );
}

export function CompareTable({ locations }: CompareTableProps) {
  if (locations.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-ink-subtle text-sm">
        暂无对比数据
      </div>
    );
  }

  const _bestScore = bestScore(locations);
  const _bestBortle = bestBortle(locations);
  const _bestViirs = bestViirs(locations);
  const _bestCloud = bestCloud(locations);
  const _bestDist = bestDistance(locations);

  return (
    <div className="overflow-x-auto rounded-lg border border-hairline bg-surface-1 data-[theme=spacex]:border-0 data-[theme=spacex]:bg-transparent data-[theme=vercel]:shadow-[0_0_0_1px_var(--color-hairline)] data-[theme=vercel]:border-0 data-[theme=supabase]:border-emerald-500/20">
      <table className="w-full border-collapse min-w-[900px]">
        <thead>
          <tr className="bg-surface-2 data-[theme=spacex]:bg-transparent">
            <th className="sticky left-0 z-10 bg-surface-2 data-[theme=spacex]:bg-transparent px-4 py-3 text-left text-[11px] font-medium text-ink-subtle uppercase tracking-widest border-r border-hairline w-[200px] data-[theme=spacex]:text-[10px] data-[theme=spacex]:tracking-[0.15em]">
              地点
            </th>
            <th className="px-3 py-3 text-center text-[11px] font-medium text-ink-subtle uppercase tracking-widest border-r border-hairline w-[72px] data-[theme=spacex]:text-[10px] data-[theme=spacex]:tracking-[0.15em]">
              评分
            </th>
            <th className="px-3 py-3 text-center text-[11px] font-medium text-ink-subtle uppercase tracking-widest border-r border-hairline w-[80px] data-[theme=spacex]:text-[10px] data-[theme=spacex]:tracking-[0.15em]">
              状态
            </th>
            <th className="px-3 py-3 text-center text-[11px] font-medium text-ink-subtle uppercase tracking-widest border-r border-hairline w-[64px] data-[theme=spacex]:text-[10px] data-[theme=spacex]:tracking-[0.15em]">
              Bortle
            </th>
            <th className="px-3 py-3 text-center text-[11px] font-medium text-ink-subtle uppercase tracking-widest border-r border-hairline w-[72px] data-[theme=spacex]:text-[10px] data-[theme=spacex]:tracking-[0.15em]">
              VIIRS
            </th>
            <th className="px-3 py-3 text-center text-[11px] font-medium text-ink-subtle uppercase tracking-widest border-r border-hairline w-[88px] data-[theme=spacex]:text-[10px] data-[theme=spacex]:tracking-[0.15em]">
              云量
            </th>
            <th className="px-3 py-3 text-center text-[11px] font-medium text-ink-subtle uppercase tracking-widest border-r border-hairline w-[72px] data-[theme=spacex]:text-[10px] data-[theme=spacex]:tracking-[0.15em]">
              月相
            </th>
            <th className="px-3 py-3 text-center text-[11px] font-medium text-ink-subtle uppercase tracking-widest border-r border-hairline w-[80px] data-[theme=spacex]:text-[10px] data-[theme=spacex]:tracking-[0.15em]">
              距离
            </th>
            <th className="px-3 py-3 text-left text-[11px] font-medium text-ink-subtle uppercase tracking-widest data-[theme=spacex]:text-[10px] data-[theme=spacex]:tracking-[0.15em]">
              风险标签
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-hairline">
          {locations.map((loc) => {
            const risks = getRiskTags(loc);
            return (
              <tr
                key={loc.id}
                className="group hover:bg-surface-2/50 transition-colors"
              >
                <td className="sticky left-0 z-10 bg-surface-1 group-hover:bg-surface-2/50 px-4 py-2.5 border-r border-hairline transition-colors">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[14px] font-semibold text-ink leading-tight tracking-tight">
                      {loc.name}
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {loc.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] text-ink-subtle bg-surface-3 px-1.5 py-px rounded"
                        >
                          {tag}
                        </span>
                      ))}
                      <span className="text-[10px] text-ink-tertiary font-mono">
                        {loc.elevation}
                      </span>
                    </div>
                  </div>
                </td>

                <CellHighlight isBest={loc.score === _bestScore}>
                  <span className="text-[15px] font-semibold tabular-nums">
                    {loc.score}
                  </span>
                </CellHighlight>

                <td className="px-3 py-2.5 text-center border-r border-hairline">
                  <StatusBadge status={loc.status} />
                </td>

                <CellHighlight isBest={loc.bortle === _bestBortle}>
                  <span className="tabular-nums">{loc.bortle}</span>
                </CellHighlight>

                <CellHighlight isBest={loc.viirs === _bestViirs}>
                  <span className="tabular-nums">{loc.viirs}</span>
                  <span className="text-[10px] text-ink-subtle ml-0.5">
                    nW
                  </span>
                </CellHighlight>

                <CellHighlight isBest={loc.cloudCover === _bestCloud}>
                  <div className="flex flex-col items-center gap-1">
                    <span className="tabular-nums">{loc.cloudCover}%</span>
                    <div className="w-full h-1 rounded-full bg-surface-3 overflow-hidden">
                      <div
                        className={clsx(
                          "h-full rounded-full transition-all",
                          loc.cloudCover <= 20
                            ? "bg-success"
                            : loc.cloudCover <= 50
                              ? "bg-warning"
                              : "bg-danger"
                        )}
                        style={{ width: `${loc.cloudCover}%` }}
                      />
                    </div>
                  </div>
                </CellHighlight>

                <td className="px-3 py-2.5 text-center font-mono text-[13px] leading-tight border-r border-hairline">
                  <span
                    className={clsx(
                      loc.moonPhase === "新月"
                        ? "text-success"
                        : "text-warning"
                    )}
                  >
                    {loc.moonPhase}
                  </span>
                </td>

                <CellHighlight
                  isBest={parseDistance(loc.distance) === _bestDist}
                >
                  <span className="tabular-nums">{loc.distance}</span>
                </CellHighlight>

                <td className="px-3 py-2.5">
                  {risks.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {risks.map((r) => (
                        <RiskTag key={r} label={r} />
                      ))}
                    </div>
                  ) : (
                    <span className="text-[11px] text-ink-subtle">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
