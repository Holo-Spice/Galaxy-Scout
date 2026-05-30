import type { LightQueryResult, LightScoreResult } from "./types";
import type { Recommendation } from "../compare/types";
import { SQM_SCORE_MAP } from "./constants";

const DARKNESS_CLASS_SCORE_MAP: Record<number, number> = {
  1: 100,
  2: 85,
  3: 70,
  4: 50,
  5: 10,
};

function getLabel(score: number): string {
  if (score >= 90) return "极佳";
  if (score >= 80) return "良好";
  if (score >= 60) return "一般";
  if (score >= 40) return "较差";
  return "极差";
}

function getRecommendation(score: number): Recommendation {
  if (score >= 80) return "recommended";
  if (score >= 50) return "watch";
  return "not_recommended";
}

export function scoreLightPollution(result: LightQueryResult): LightScoreResult {
  const reasons: string[] = [];
  const risks: string[] = [];

  if (result.sqmEstimate !== null) {
    const sqm = result.sqmEstimate;
    const entry = SQM_SCORE_MAP.find((e) => sqm >= e.minSqm);
    const score = entry ? entry.score : 10;

    if (score >= 85) {
      reasons.push("天空极暗，适合天文观测");
    } else if (score >= 50) {
      reasons.push("天空亮度中等");
    } else {
      reasons.push("天空较亮，光污染明显");
      risks.push("光污染严重，不适合天文观测");
    }

    return {
      score,
      label: getLabel(score),
      reasons,
      risks: risks.length > 0 ? risks : undefined,
      recommendation: getRecommendation(score),
    };
  }

  if (result.darknessClass !== null) {
    const score = DARKNESS_CLASS_SCORE_MAP[result.darknessClass] ?? 0;

    reasons.push(`基于暗天等级 ${result.darknessClass} 估算`);

    if (score < 50) {
      risks.push("光污染严重，不适合天文观测");
    }

    return {
      score,
      label: getLabel(score),
      reasons,
      risks: risks.length > 0 ? risks : undefined,
      recommendation: getRecommendation(score),
    };
  }

  return {
    score: 0,
    label: "无数据",
    reasons: ["缺少光污染数据"],
    recommendation: "unknown",
  };
}
