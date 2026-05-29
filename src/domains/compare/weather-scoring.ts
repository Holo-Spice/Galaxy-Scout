import type { WeatherHourlyData } from "../weather/types";
import type { Recommendation } from "./types";

export interface WeatherScoreResult {
  score: number;
  recommendation: Recommendation;
  reasons: string[];
  risks: string[];
}

export function scoreWeatherHourly(data: WeatherHourlyData): WeatherScoreResult {
  const reasons: string[] = [];
  const risks: string[] = [];

  if (data.cloud_cover_pct === null || data.cloud_cover_pct === undefined) {
    return { score: 100, recommendation: "unknown", reasons: ["数据不足"], risks: [] };
  }

  let penalty = 0;

  const cloudPenalty = Math.min(Math.floor(data.cloud_cover_pct / 10) * 5, 50);
  penalty += cloudPenalty;
  if (cloudPenalty === 0) {
    reasons.push("云量低");
  } else if (cloudPenalty >= 25) {
    risks.push("云量高");
  }

  if (data.cloud_cover_high_pct !== null && data.cloud_cover_high_pct !== undefined) {
    const highCloudPenalty = Math.floor(data.cloud_cover_high_pct / 10) * 3;
    penalty += highCloudPenalty;
    if (highCloudPenalty > 0) {
      risks.push("高云较多");
    }
  }

  if (data.precipitation_probability_pct !== null && data.precipitation_probability_pct !== undefined) {
    const precipProbPenalty = Math.min(Math.floor(data.precipitation_probability_pct / 10) * 8, 80);
    penalty += precipProbPenalty;
    if (precipProbPenalty >= 24) {
      risks.push("降水概率高");
    }
  }

  if (data.visibility_m !== null && data.visibility_m !== undefined) {
    if (data.visibility_m < 10000) {
      penalty += 15;
      risks.push("能见度低");
    } else {
      reasons.push("能见度好");
    }
  }

  if (data.wind_speed_10m_kmh !== null && data.wind_speed_10m_kmh !== undefined) {
    if (data.wind_speed_10m_kmh > 25) {
      const windPenalty = Math.min(data.wind_speed_10m_kmh - 25, 15);
      penalty += windPenalty;
      risks.push("风速大");
    }
  }

  if (data.relative_humidity_2m_pct !== null && data.relative_humidity_2m_pct !== undefined) {
    if (data.relative_humidity_2m_pct > 85) {
      penalty += 10;
      risks.push("湿度高，注意结露");
    }
  }

  const score = Math.max(0, 100 - penalty);

  const hasPrecipHardMark = data.precipitation_mm !== null && data.precipitation_mm !== undefined && data.precipitation_mm > 0.5;
  const hasCloudHardMark = data.cloud_cover_pct > 70 && data.cloud_cover_high_pct !== null && data.cloud_cover_high_pct !== undefined && data.cloud_cover_high_pct > 50;

  if (hasPrecipHardMark) {
    risks.push("有降水");
  }

  let recommendation: Recommendation;
  if (hasPrecipHardMark || hasCloudHardMark) {
    recommendation = "not_recommended";
  } else if (score >= 70) {
    recommendation = "recommended";
  } else if (score >= 40) {
    recommendation = "watch";
  } else {
    recommendation = "not_recommended";
  }

  return { score, recommendation, reasons, risks };
}
