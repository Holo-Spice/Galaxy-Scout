import { VIIRS_RADIANCE_THRESHOLDS } from "./constants";

/**
 * Convert VIIRS DNB radiance to darkness class (1-5).
 * Uses VIIRS_RADIANCE_THRESHOLDS from constants.ts.
 *
 * @param radiance - VIIRS radiance in nW·cm⁻²·sr⁻¹, or null if unavailable
 * @returns darknessClass (1=darkest, 5=brightest) and confidence level
 */
export function viirsToDarknessClass(radiance: number | null): {
  darknessClass: number | null;
  confidence: "high" | "medium" | "low" | "unknown";
} {
  if (radiance === null || radiance === undefined) {
    return { darknessClass: null, confidence: "low" };
  }

  for (const threshold of VIIRS_RADIANCE_THRESHOLDS) {
    if (radiance <= threshold.maxRadiance) {
      return { darknessClass: threshold.class, confidence: "high" };
    }
  }

  // Fallback (should not reach here due to Infinity threshold)
  return { darknessClass: 5, confidence: "medium" };
}

/**
 * Estimate SQM (Sky Quality Meter) value from VIIRS radiance.
 * Formula: SQM ≈ 22.0 - 1.5 × log10(radiance + 0.01)
 *
 * @param radiance - VIIRS radiance in nW·cm⁻²·sr⁻¹, or null if unavailable
 * @returns Estimated SQM in mag/arcsec², or null if radiance unavailable
 */
export function viirsToSqm(radiance: number | null): number | null {
  if (radiance === null || radiance === undefined) {
    return null;
  }

  return 22.0 - 1.5 * Math.log10(radiance + 0.01);
}

/**
 * Map SQM value to Bortle class (1-9).
 * Higher SQM = darker sky = lower Bortle class.
 *
 * Thresholds based on standard SQM-Bortle correlation:
 *   Bortle 1: SQM >= 21.75 (pristine)
 *   Bortle 2: SQM >= 21.6
 *   Bortle 3: SQM >= 21.3
 *   Bortle 4: SQM >= 20.8
 *   Bortle 5: SQM >= 20.3
 *   Bortle 6: SQM >= 19.5
 *   Bortle 7: SQM >= 19.0
 *   Bortle 8: SQM >= 18.5
 *   Bortle 9: SQM < 18.5
 *
 * @param sqm - SQM value in mag/arcsec²
 * @returns Bortle class 1-9
 */
export function sqmToBortle(sqm: number): number {
  if (sqm >= 21.75) return 1;
  if (sqm >= 21.6) return 2;
  if (sqm >= 21.3) return 3;
  if (sqm >= 20.8) return 4;
  if (sqm >= 20.3) return 5;
  if (sqm >= 19.5) return 6;
  if (sqm >= 19.0) return 7;
  if (sqm >= 18.5) return 8;
  return 9;
}

/**
 * Estimate Bortle class from VIIRS radiance.
 * This is ALWAYS an estimate — never presented as measured.
 * Chains: radiance → SQM → Bortle.
 *
 * @param radiance - VIIRS radiance in nW·cm⁻²·sr⁻¹, or null if unavailable
 * @returns Bortle estimate and confidence level
 */
export function estimateBortleFromViirs(radiance: number | null): {
  bortle: number | null;
  confidence: string;
} {
  if (radiance === null || radiance === undefined) {
    return { bortle: null, confidence: "unknown" };
  }

  const sqm = viirsToSqm(radiance);
  if (sqm === null) {
    return { bortle: null, confidence: "unknown" };
  }

  const bortle = sqmToBortle(sqm);
  // Always "low" confidence when derived from VIIRS — this is an estimate
  return { bortle, confidence: "low" };
}
