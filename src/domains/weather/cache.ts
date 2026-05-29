import { db } from "@/lib/db";
import { weather_hourly_cache } from "@/lib/db/schema";
import { eq, and, lte, gt } from "drizzle-orm";
import type { WeatherHourlyData } from "./types";

const TTL_72H = 60;
const TTL_7D = 180;
const TTL_16D = 360;
const TTL_OVER_16D = 720;

const MS_72H = 72 * 60 * 60 * 1000;
const MS_7D = 7 * 24 * 60 * 60 * 1000;
const MS_16D = 16 * 24 * 60 * 60 * 1000;

export function getCacheTTL(forecastHourUtc: Date, now?: Date): number {
  const reference = now ?? new Date();
  const diffMs = forecastHourUtc.getTime() - reference.getTime();

  if (diffMs <= MS_72H) return TTL_72H;
  if (diffMs <= MS_7D) return TTL_7D;
  if (diffMs <= MS_16D) return TTL_16D;
  return TTL_OVER_16D;
}

export async function getCachedWeatherOrDefault(
  locationHash: string,
  forecastHourUtc: string,
): Promise<{ data: WeatherHourlyData | null; stale: boolean }> {
  const nowIso = new Date().toISOString();

  const freshRows = await db
    .select()
    .from(weather_hourly_cache)
    .where(
      and(
        eq(weather_hourly_cache.location_hash, locationHash),
        eq(weather_hourly_cache.forecast_hour_utc, forecastHourUtc),
        gt(weather_hourly_cache.expires_at, nowIso),
      ),
    )
    .limit(1);

  if (freshRows.length > 0) {
    return { data: toWeatherHourlyData(freshRows[0]), stale: false };
  }

  const staleRows = await db
    .select()
    .from(weather_hourly_cache)
    .where(
      and(
        eq(weather_hourly_cache.location_hash, locationHash),
        eq(weather_hourly_cache.forecast_hour_utc, forecastHourUtc),
        lte(weather_hourly_cache.expires_at, nowIso),
      ),
    )
    .limit(1);

  if (staleRows.length > 0) {
    return { data: toWeatherHourlyData(staleRows[0]), stale: true };
  }

  return { data: null, stale: false };
}

export async function upsertWeatherCache(
  locationHash: string,
  provider: string,
  hourlyData: WeatherHourlyData[],
): Promise<void> {
  const fetchedAt = new Date();

  for (const hour of hourlyData) {
    const forecastDate = new Date(hour.forecast_hour_utc + "Z");
    const ttlMin = getCacheTTL(forecastDate, fetchedAt);
    const expiresAt = new Date(fetchedAt.getTime() + ttlMin * 60 * 1000);

    await db
      .insert(weather_hourly_cache)
      .values({
        location_hash: locationHash,
        provider,
        forecast_hour_utc: hour.forecast_hour_utc,
        fetched_at: fetchedAt.toISOString(),
        expires_at: expiresAt.toISOString(),
        temperature_2m_c: hour.temperature_2m_c,
        relative_humidity_2m_pct: hour.relative_humidity_2m_pct,
        dew_point_2m_c: hour.dew_point_2m_c,
        precipitation_probability_pct: hour.precipitation_probability_pct,
        precipitation_mm: hour.precipitation_mm,
        cloud_cover_pct: hour.cloud_cover_pct,
        cloud_cover_low_pct: hour.cloud_cover_low_pct,
        cloud_cover_mid_pct: hour.cloud_cover_mid_pct,
        cloud_cover_high_pct: hour.cloud_cover_high_pct,
        visibility_m: hour.visibility_m,
        wind_speed_10m_kmh: hour.wind_speed_10m_kmh,
        wind_gusts_10m_kmh: hour.wind_gusts_10m_kmh,
        weather_code: hour.weather_code,
      })
      .onConflictDoUpdate({
        target: [
          weather_hourly_cache.location_hash,
          weather_hourly_cache.forecast_hour_utc,
        ],
        set: {
          provider,
          fetched_at: fetchedAt.toISOString(),
          expires_at: expiresAt.toISOString(),
          temperature_2m_c: hour.temperature_2m_c,
          relative_humidity_2m_pct: hour.relative_humidity_2m_pct,
          dew_point_2m_c: hour.dew_point_2m_c,
          precipitation_probability_pct: hour.precipitation_probability_pct,
          precipitation_mm: hour.precipitation_mm,
          cloud_cover_pct: hour.cloud_cover_pct,
          cloud_cover_low_pct: hour.cloud_cover_low_pct,
          cloud_cover_mid_pct: hour.cloud_cover_mid_pct,
          cloud_cover_high_pct: hour.cloud_cover_high_pct,
          visibility_m: hour.visibility_m,
          wind_speed_10m_kmh: hour.wind_speed_10m_kmh,
          wind_gusts_10m_kmh: hour.wind_gusts_10m_kmh,
          weather_code: hour.weather_code,
        },
      });
  }
}

function toWeatherHourlyData(row: typeof weather_hourly_cache.$inferSelect): WeatherHourlyData {
  return {
    forecast_hour_utc: row.forecast_hour_utc,
    temperature_2m_c: row.temperature_2m_c,
    relative_humidity_2m_pct: row.relative_humidity_2m_pct,
    dew_point_2m_c: row.dew_point_2m_c,
    precipitation_probability_pct: row.precipitation_probability_pct,
    precipitation_mm: row.precipitation_mm,
    cloud_cover_pct: row.cloud_cover_pct,
    cloud_cover_low_pct: row.cloud_cover_low_pct,
    cloud_cover_mid_pct: row.cloud_cover_mid_pct,
    cloud_cover_high_pct: row.cloud_cover_high_pct,
    visibility_m: row.visibility_m,
    wind_speed_10m_kmh: row.wind_speed_10m_kmh,
    wind_gusts_10m_kmh: row.wind_gusts_10m_kmh,
    weather_code: row.weather_code,
  };
}
