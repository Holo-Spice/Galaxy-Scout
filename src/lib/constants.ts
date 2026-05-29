export type LocationStatus = "recommended" | "watch" | "not_recommended" | "unknown";

export const STATUS_CONFIG: Record<
  LocationStatus,
  { label: string; color: string; bg: string; dot?: string }
> = {
  recommended: {
    label: "推荐",
    color: "text-success",
    bg: "bg-success-muted",
    dot: "bg-success",
  },
  watch: {
    label: "观望",
    color: "text-warning",
    bg: "bg-warning-muted",
    dot: "bg-warning",
  },
  not_recommended: {
    label: "不推荐",
    color: "text-danger",
    bg: "bg-danger-muted",
    dot: "bg-danger",
  },
  unknown: {
    label: "未知",
    color: "text-ink-subtle",
    bg: "bg-surface-2",
  },
};

export const RISK_THRESHOLDS = {
  BORTLE_HIGH: 5,
  BORTLE_MEDIUM: 3,
  CLOUD_HIGH: 50,
  CLOUD_MEDIUM: 30,
  PRECIP_HIGH: 30,
  PRECIP_MEDIUM: 10,
  DISTANCE_FAR: 300,
} as const;

export function getRiskTags(loc: {
  bortle: number | null;
  cloudCover: number;
  precipitation: number;
  moonPhase: string | null;
  distance: string | null;
  bestHour: string;
}): string[] {
  const risks: string[] = [];
  if (loc.bortle != null && loc.bortle >= RISK_THRESHOLDS.BORTLE_HIGH) risks.push("光害严重");
  else if (loc.bortle != null && loc.bortle >= RISK_THRESHOLDS.BORTLE_MEDIUM) risks.push("光害中等");
  if (loc.cloudCover >= RISK_THRESHOLDS.CLOUD_HIGH) risks.push("多云");
  else if (loc.cloudCover >= RISK_THRESHOLDS.CLOUD_MEDIUM) risks.push("有云");
  if (loc.precipitation >= RISK_THRESHOLDS.PRECIP_HIGH) risks.push("降水风险");
  else if (loc.precipitation >= RISK_THRESHOLDS.PRECIP_MEDIUM) risks.push("少量降水");
  if (loc.moonPhase != null && loc.moonPhase !== "新月") risks.push("月光干扰");
  const distNum = loc.distance != null ? parseInt(loc.distance) : NaN;
  if (!isNaN(distNum) && distNum >= RISK_THRESHOLDS.DISTANCE_FAR) risks.push("路途遥远");
  if (loc.bestHour === "N/A") risks.push("无观测窗口");
  return risks;
}
