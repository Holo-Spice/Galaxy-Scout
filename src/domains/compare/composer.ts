import { db } from "@/lib/db";
import { locations } from "@/lib/db/schema";
import { eq, and, isNull, inArray } from "drizzle-orm";
import { fetchForecast, WeatherProviderError } from "@/domains/weather/adapter";
import {
  getCachedWeatherOrDefault,
  upsertWeatherCache,
} from "@/domains/weather/cache";
import { scoreWeatherHourly } from "@/domains/compare/weather-scoring";
import { scoreDistance } from "@/domains/compare/distance-scoring";
import { scoreAstronomyHourly } from "@/domains/compare/astronomy-scoring";
import { computeHourlyAstronomy } from "@/domains/astronomy/engine";
import {
  getCachedAstronomy,
  upsertAstronomyCache,
} from "@/domains/astronomy/cache";
import { generateLocationHash } from "@/lib/geo/location-hash";
import { haversineDistance } from "@/lib/geo";
import type { WeatherHourlyData } from "@/domains/weather/types";
import type { AstronomyHourlyData } from "@/domains/astronomy/types";
import type {
  CompareRequest,
  CompareResult,
  CompareMeta,
  LocationCompareItem,
  HourlyCompareData,
  LocationSummary,
  Recommendation,
} from "@/domains/compare/types";

/** @deprecated M2 二因子权重，M4 统一清理 */
const M2_WEATHER_WEIGHT = 0.8;
/** @deprecated M2 二因子权重，M4 统一清理 */
const M2_DISTANCE_WEIGHT = 0.2;

const M3_WEATHER_WEIGHT = 0.47;
const M3_ASTRONOMY_WEIGHT = 0.40;
const M3_DISTANCE_WEIGHT = 0.13;

interface LocationRow {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  deleted_at: string | null;
}

async function fetchLocationById(id: string): Promise<LocationRow | null> {
  const rows = await db
    .select({
      id: locations.id,
      name: locations.name,
      latitude: locations.latitude,
      longitude: locations.longitude,
      deleted_at: locations.deleted_at,
    })
    .from(locations)
    .where(and(eq(locations.id, id), isNull(locations.deleted_at)))
    .limit(1);

  return rows.length > 0 ? (rows[0] as LocationRow) : null;
}

async function resolveHourlyData(
  loc: LocationRow,
  dateLocal: string,
  startHourLocal: number,
  endHourLocal: number,
  timezone: string,
): Promise<WeatherHourlyData[]> {
  const locationHash = generateLocationHash(loc.latitude, loc.longitude);
  const hours = buildHourList(dateLocal, startHourLocal, endHourLocal, timezone);

  const results: WeatherHourlyData[] = [];
  const uncachedIndices: number[] = [];
  const uncachedUtcHours: string[] = [];

  for (let i = 0; i < hours.length; i++) {
    const { data, stale } = await getCachedWeatherOrDefault(
      locationHash,
      hours[i].utc,
    );
    if (data !== null) {
      results[i] = data;
    } else {
      uncachedIndices.push(i);
      uncachedUtcHours.push(hours[i].utc);
    }
  }

  if (uncachedIndices.length > 0) {
    const fetched = await fetchForecast(
      [{ lat: loc.latitude, lon: loc.longitude }],
      7,
    );
    const hourlyForLoc = fetched[0];

    await upsertWeatherCache(locationHash, "open-meteo", hourlyForLoc);

    for (const idx of uncachedIndices) {
      const utcHour = hours[idx].utc;
      const match = hourlyForLoc.find((h) => h.forecast_hour_utc === utcHour);
      results[idx] = match ?? makeEmptyHourlyData(utcHour);
    }
  }

  return results;
}

async function resolveAstronomyData(
  loc: LocationRow,
  hours: { local: string; utc: string }[],
): Promise<AstronomyHourlyData[]> {
  const locationHash = generateLocationHash(loc.latitude, loc.longitude);

  const results: AstronomyHourlyData[] = [];
  const uncachedIndices: number[] = [];
  const uncachedUtcHours: string[] = [];

  for (let i = 0; i < hours.length; i++) {
    const cached = await getCachedAstronomy(locationHash, hours[i].utc);
    if (cached !== null) {
      results[i] = cached;
    } else {
      uncachedIndices.push(i);
      uncachedUtcHours.push(hours[i].utc);
    }
  }

  if (uncachedIndices.length > 0) {
    const computed = computeHourlyAstronomy(
      { latitude: loc.latitude, longitude: loc.longitude, dateLocal: "", timezone: "" },
      uncachedUtcHours,
    );

    await upsertAstronomyCache(locationHash, computed);

    for (let j = 0; j < uncachedIndices.length; j++) {
      results[uncachedIndices[j]] = computed[j];
    }
  }

  return results;
}

function buildHourList(
  dateLocal: string,
  startHourLocal: number,
  endHourLocal: number,
  timezone: string,
): { local: string; utc: string }[] {
  const hours: { local: string; utc: string }[] = [];
  const crossesMidnight = startHourLocal > endHourLocal;

  let currentHour = startHourLocal;
  const endDate = crossesMidnight
    ? addDays(dateLocal, 1)
    : dateLocal;

  while (true) {
    const day = currentHour >= 24 ? endDate : dateLocal;
    const hour = currentHour >= 24 ? currentHour - 24 : currentHour;
    const localIso = `${day}T${String(hour).padStart(2, "0")}:00:00`;

    const utcDate = localToUtc(day, hour, timezone);
    const utcIso = utcDate.toISOString().replace(/\.\d{3}Z$/, "").replace(/:00$/, "");

    hours.push({ local: localIso, utc: utcIso });

    if (!crossesMidnight) {
      if (currentHour >= endHourLocal) break;
    } else {
      if (currentHour >= 24 + endHourLocal) break;
    }
    currentHour++;
  }

  return hours;
}

function localToUtc(date: string, hour: number, timezone: string): Date {
  const naive = new Date(`${date}T${String(hour).padStart(2, "0")}:00:00`);
  const utcOffset = getTimezoneOffset(timezone, naive);
  return new Date(naive.getTime() - utcOffset);
}

function getTimezoneOffset(timezone: string, date: Date): number {
  const utcStr = date.toLocaleString("en-US", { timeZone: "UTC" });
  const tzStr = date.toLocaleString("en-US", { timeZone: timezone });
  return new Date(tzStr).getTime() - new Date(utcStr).getTime();
}

function addDays(date: string, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function makeEmptyHourlyData(utcHour: string): WeatherHourlyData {
  return {
    forecast_hour_utc: utcHour,
    temperature_2m_c: null,
    relative_humidity_2m_pct: null,
    dew_point_2m_c: null,
    precipitation_probability_pct: null,
    precipitation_mm: null,
    weather_code: null,
    cloud_cover_pct: null,
    cloud_cover_low_pct: null,
    cloud_cover_mid_pct: null,
    cloud_cover_high_pct: null,
    visibility_m: null,
    wind_speed_10m_kmh: null,
    wind_gusts_10m_kmh: null,
  };
}

function computeHourlyScores(
  hourlyData: WeatherHourlyData[],
  astronomyData: AstronomyHourlyData[],
  distanceKm: number | null,
  hours: { local: string; utc: string }[],
): { hourly: HourlyCompareData[]; bestIndex: number } {
  const scored: HourlyCompareData[] = [];
  let bestIndex = 0;
  let bestTotal = -1;

  for (let i = 0; i < hourlyData.length; i++) {
    const weather = scoreWeatherHourly(hourlyData[i]);
    const astro = scoreAstronomyHourly(astronomyData[i]);
    const dist = distanceKm !== null ? scoreDistance(distanceKm) : { score: 100, label: "" };

    const totalScore = Math.round(
      weather.score * M3_WEATHER_WEIGHT +
      astro.score * M3_ASTRONOMY_WEIGHT +
      dist.score * M3_DISTANCE_WEIGHT,
    );

    const recommendation: Recommendation =
      weather.recommendation === "not_recommended"
        ? "not_recommended"
        : totalScore >= 70
          ? "recommended"
          : totalScore >= 40
            ? "watch"
            : "not_recommended";

    const entry: HourlyCompareData = {
      hourLocal: hours[i]?.local ?? "",
      weatherScore: weather.score,
      lightScore: 0,
      astronomyScore: astro.score,
      distanceScore: dist.score,
      totalScore,
      recommendation,
      topReasons: [...weather.reasons, ...astro.reasons],
      risks: [...(weather.risks ?? []), ...(astro.risks ?? [])],
      cloudCoverPct: hourlyData[i].cloud_cover_pct,
      precipitationMm: hourlyData[i].precipitation_mm,
      visibilityM: hourlyData[i].visibility_m,
      windSpeed10mKmh: hourlyData[i].wind_speed_10m_kmh,
      temperature2mC: hourlyData[i].temperature_2m_c,
      moonPhaseName: astronomyData[i]?.moon_phase_name,
    };

    if (totalScore > bestTotal) {
      bestTotal = totalScore;
      bestIndex = i;
    }

    scored.push(entry);
  }

  return { hourly: scored, bestIndex };
}

export async function composeCompareResult(
  req: CompareRequest,
): Promise<CompareResult> {
  const uniqueIds = Array.from(new Set(req.locationIds));

  const locationRows: LocationRow[] = [];
  for (const id of uniqueIds) {
    const row = await fetchLocationById(id);
    if (row !== null) {
      locationRows.push(row);
    }
  }

  if (locationRows.length === 0) {
    throw new WeatherProviderError("No valid locations found");
  }

  const hours = buildHourList(
    req.dateLocal,
    req.startHourLocal,
    req.endHourLocal,
    req.timezone,
  );

  const items: LocationCompareItem[] = [];
  let globalBestLocationId = locationRows[0].id;
  let globalBestTotal = -1;

  for (const loc of locationRows) {
    const hourlyData = await resolveHourlyData(
      loc,
      req.dateLocal,
      req.startHourLocal,
      req.endHourLocal,
      req.timezone,
    );

    const astronomyData = await resolveAstronomyData(loc, hours);

    const distanceKm =
      req.origin !== undefined
        ? haversineDistance(
            req.origin.latitude,
            req.origin.longitude,
            loc.latitude,
            loc.longitude,
          )
        : null;

    const { hourly, bestIndex } = computeHourlyScores(
      hourlyData,
      astronomyData,
      distanceKm,
      hours,
    );

    const bestHour = hourly[bestIndex];
    const summary: LocationSummary = {
      bestHourLocal: bestHour?.hourLocal ?? "",
      totalScore: bestHour?.totalScore ?? 0,
      distanceKm: distanceKm !== null ? Math.round(distanceKm * 10) / 10 : null,
      distanceMode: distanceKm !== null ? "straight_line" : null,
      recommendation: bestHour?.recommendation ?? "unknown",
      topReasons: bestHour?.topReasons ?? [],
      risks: bestHour?.risks,
    };

    if (summary.totalScore > globalBestTotal) {
      globalBestTotal = summary.totalScore;
      globalBestLocationId = loc.id;
    }

    items.push({
      locationId: loc.id,
      summary,
      lightPollution: null,
      hourly,
    });
  }

  const meta: CompareMeta = {
    generatedAt: new Date().toISOString(),
    weatherSource: "open-meteo",
    staleLocationIds: [],
  };

  return {
    bestLocationId: globalBestLocationId,
    items,
    meta,
  };
}
