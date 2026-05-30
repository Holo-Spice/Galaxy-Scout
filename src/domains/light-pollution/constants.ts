/**
 * VIIRS DNB radiance thresholds for darkness classification.
 * Radiance in nW·cm⁻²·sr⁻¹.
 * darkness_class 1 = darkest (pristine), 5 = brightest (urban).
 */
export const VIIRS_RADIANCE_THRESHOLDS: readonly { class: number; maxRadiance: number; label: string }[] = [
  { class: 1, maxRadiance: 0.5, label: "极暗" },
  { class: 2, maxRadiance: 2, label: "暗" },
  { class: 3, maxRadiance: 5, label: "中等" },
  { class: 4, maxRadiance: 15, label: "较亮" },
  { class: 5, maxRadiance: Infinity, label: "明亮" },
] as const;

/**
 * SQM (mag/arcsec²) to score mapping.
 * Higher SQM = darker sky = better for astronomy.
 * From docs/05-compare-scoring.md.
 */
export const SQM_SCORE_MAP: readonly { minSqm: number; score: number }[] = [
  { minSqm: 21.75, score: 100 },
  { minSqm: 21.3, score: 85 },
  { minSqm: 20.8, score: 70 },
  { minSqm: 20.0, score: 50 },
  { minSqm: 19.0, score: 30 },
  { minSqm: -Infinity, score: 10 },
] as const;
