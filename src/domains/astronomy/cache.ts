import { db } from "@/lib/db";
import { astronomy_hourly_cache } from "@/lib/db/schema";
import { eq, and, gt } from "drizzle-orm";
import type { AstronomyHourlyData } from "./types";

const TTL_24H_MS = 24 * 60 * 60 * 1000;

export async function getCachedAstronomy(
  locationHash: string,
  hourUtc: string,
): Promise<AstronomyHourlyData | null> {
  const nowIso = new Date().toISOString();

  const rows = await db
    .select()
    .from(astronomy_hourly_cache)
    .where(
      and(
        eq(astronomy_hourly_cache.location_hash, locationHash),
        eq(astronomy_hourly_cache.hour_utc, hourUtc),
        gt(astronomy_hourly_cache.expires_at, nowIso),
      ),
    )
    .limit(1);

  if (rows.length === 0) return null;
  return toAstronomyHourlyData(rows[0]);
}

export async function upsertAstronomyCache(
  locationHash: string,
  hourlyData: AstronomyHourlyData[],
): Promise<void> {
  const fetchedAt = new Date();
  const expiresAt = new Date(fetchedAt.getTime() + TTL_24H_MS);

  for (const hour of hourlyData) {
    await db
      .insert(astronomy_hourly_cache)
      .values({
        location_hash: locationHash,
        hour_utc: hour.hour_utc,
        sun_altitude_deg: hour.sun_altitude_deg,
        moon_altitude_deg: hour.moon_altitude_deg,
        moon_illumination_pct: hour.moon_illumination_pct,
        moon_phase_name: hour.moon_phase_name,
        galactic_center_altitude_deg: hour.galactic_center_altitude_deg,
        is_astronomical_night: hour.is_astronomical_night,
        fetched_at: fetchedAt.toISOString(),
        expires_at: expiresAt.toISOString(),
      })
      .onConflictDoUpdate({
        target: [
          astronomy_hourly_cache.location_hash,
          astronomy_hourly_cache.hour_utc,
        ],
        set: {
          sun_altitude_deg: hour.sun_altitude_deg,
          moon_altitude_deg: hour.moon_altitude_deg,
          moon_illumination_pct: hour.moon_illumination_pct,
          moon_phase_name: hour.moon_phase_name,
          galactic_center_altitude_deg: hour.galactic_center_altitude_deg,
          is_astronomical_night: hour.is_astronomical_night,
          fetched_at: fetchedAt.toISOString(),
          expires_at: expiresAt.toISOString(),
        },
      });
  }
}

function toAstronomyHourlyData(
  row: typeof astronomy_hourly_cache.$inferSelect,
): AstronomyHourlyData {
  return {
    hour_utc: row.hour_utc,
    sun_altitude_deg: row.sun_altitude_deg ?? 0,
    moon_altitude_deg: row.moon_altitude_deg ?? 0,
    moon_illumination_pct: row.moon_illumination_pct ?? 0,
    moon_phase_name: row.moon_phase_name ?? "",
    galactic_center_altitude_deg: row.galactic_center_altitude_deg ?? 0,
    is_astronomical_night: row.is_astronomical_night ?? false,
  };
}
