import { db } from "@/lib/db";
import { lightPollutionSamples } from "@/lib/db/schema";
import { generateLocationHash } from "@/lib/geo/location-hash";
import { sql } from "drizzle-orm";
import {
  getCachedLightPollution,
  setCachedLightPollution,
} from "./cache";
import type { LightQueryResult } from "./types";

const NO_DATA_RESULT: LightQueryResult = {
  radiance: null,
  darknessClass: null,
  sqmEstimate: null,
  bortleEstimate: null,
  source: "none",
  sourceYear: 0,
  confidence: "unknown",
};

export async function queryLightPollution(
  lat: number,
  lon: number,
): Promise<LightQueryResult> {
  let hash: string | null = null;
  try {
    hash = generateLocationHash(lat, lon);
    const cached = getCachedLightPollution(hash);
    if (cached) return cached;
  } catch {
    // Invalid coordinates: skip cache, fall through to DB
  }

  const rows = await db
    .select()
    .from(lightPollutionSamples)
    .orderBy(sql`ABS(${lightPollutionSamples.latitude} - ${lat}) + ABS(${lightPollutionSamples.longitude} - ${lon})`)
    .limit(1);

  if (rows.length === 0) {
    if (hash) setCachedLightPollution(hash, NO_DATA_RESULT);
    return NO_DATA_RESULT;
  }

  const row = rows[0];

  const result: LightQueryResult = {
    radiance: row.viirs_radiance ?? null,
    darknessClass: row.darkness_class ?? null,
    sqmEstimate: row.sqm_estimate ?? null,
    bortleEstimate: row.bortle_estimate ?? null,
    source: row.source,
    sourceYear: row.source_year,
    confidence: row.viirs_radiance != null ? "medium" : "unknown",
  };

  if (hash) setCachedLightPollution(hash, result);
  return result;
}
