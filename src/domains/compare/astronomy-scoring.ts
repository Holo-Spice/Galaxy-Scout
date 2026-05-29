import type { AstronomyHourlyData } from "../astronomy/types";
import type { Recommendation } from "./types";

export interface AstronomyScoreResult {
  score: number;
  recommendation: Recommendation;
  reasons: string[];
  risks: string[];
}

export function scoreAstronomyHourly(data: AstronomyHourlyData): AstronomyScoreResult {
  const reasons: string[] = [];
  const risks: string[] = [];

  const nightScore = data.is_astronomical_night ? 80 : 40;

  if (data.is_astronomical_night) {
    reasons.push("天文夜");
  } else {
    risks.push("非天文夜");
  }

  let moonPenalty = 0;
  if (data.moon_altitude_deg <= 0) {
    reasons.push("月亮已落");
  } else if (data.moon_illumination_pct > 10) {
    moonPenalty = Math.min(
      Math.round((data.moon_altitude_deg / 90) * (data.moon_illumination_pct / 100) * 40),
      40,
    );
    risks.push("月光强烈");
    if (data.moon_altitude_deg > 30) {
      risks.push("月亮高挂");
    }
  }

  let milkyWayBonus = 0;
  if (data.galactic_center_altitude_deg >= 20) {
    milkyWayBonus = 20;
    reasons.push("银河可见");
  } else if (data.galactic_center_altitude_deg >= 10) {
    milkyWayBonus = 10;
    reasons.push("银河可见");
  }

  const rawScore = nightScore - moonPenalty + milkyWayBonus;
  const score = Math.max(0, Math.min(100, rawScore));

  let recommendation: Recommendation;
  if (!data.is_astronomical_night && data.moon_altitude_deg > 0 && data.moon_illumination_pct > 10) {
    recommendation = "not_recommended";
  } else if (score >= 60) {
    recommendation = "recommended";
  } else if (score >= 40) {
    recommendation = "watch";
  } else {
    recommendation = "not_recommended";
  }

  return { score, recommendation, reasons, risks };
}
