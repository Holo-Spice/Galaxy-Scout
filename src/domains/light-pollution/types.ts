import type { Recommendation } from "../compare/types";

/**
 * Raw VIIRS satellite radiance sample at a single point.
 */
export interface ViirsSample {
  latitude: number;
  longitude: number;
  /** DNB radiance in nW·cm⁻²·sr⁻¹ */
  radiance: number;
}

/**
 * Normalized light pollution query result.
 * Compatible with LightPollutionInfo from compare/types.ts (source, sourceYear, confidence).
 */
export interface LightQueryResult {
  /** Raw VIIRS radiance value (nW·cm⁻²·sr⁻¹), null if unavailable */
  radiance: number | null;
  /** Darkness class 1-5 derived from radiance thresholds, null if unavailable */
  darknessClass: number | null;
  /** Estimated SQM (mag/arcsec²), null if unavailable */
  sqmEstimate: number | null;
  /** Estimated Bortle class, null if unavailable */
  bortleEstimate: number | null;
  /** Data source identifier (e.g. "viirs-2024", "world-atlas-2015") */
  source: string;
  /** Year of the source data */
  sourceYear: number;
  /** Confidence level of the data */
  confidence: "high" | "medium" | "low" | "unknown";
}

/**
 * Final scored light pollution result for display.
 */
export interface LightScoreResult {
  /** Score 0-100 */
  score: number;
  /** Human-readable label (e.g. "极佳", "良好", "一般", "较差") */
  label: string;
  /** Explanation of why this score was given */
  reasons: string[];
  /** Potential risks or caveats */
  risks?: string[];
  /** Overall recommendation */
  recommendation: Recommendation;
}
