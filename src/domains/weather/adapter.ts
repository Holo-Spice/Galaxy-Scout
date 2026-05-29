import type { WeatherHourlyData, WeatherProviderResponse } from "./types";

const OPEN_METEO_BASE = "https://api.open-meteo.com/v1/forecast";

const HOURLY_FIELDS = [
  "temperature_2m",
  "relative_humidity_2m",
  "dew_point_2m",
  "precipitation_probability",
  "precipitation",
  "weather_code",
  "cloud_cover",
  "cloud_cover_low",
  "cloud_cover_mid",
  "cloud_cover_high",
  "visibility",
  "wind_speed_10m",
  "wind_gusts_10m",
].join(",");

export class WeatherProviderError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "WeatherProviderError";
  }
}

export function buildOpenMeteoUrl(
  coords: { lat: number; lon: number }[],
  days: number = 7,
): string {
  if (coords.length === 0) {
    throw new Error("coords must contain at least one coordinate");
  }

  const lats = coords.map((c) => String(c.lat)).join(",");
  const lons = coords.map((c) => String(c.lon)).join(",");

  return [
    `${OPEN_METEO_BASE}?latitude=${lats}`,
    `longitude=${lons}`,
    `hourly=${HOURLY_FIELDS}`,
    `forecast_days=${days}`,
    "timezone=GMT",
    "wind_speed_unit=kmh",
    "precipitation_unit=mm",
    "cell_selection=land",
  ].join("&");
}

function normalizeSingleLocation(raw: WeatherProviderResponse): WeatherHourlyData[] {
  const h = raw?.hourly;
  if (!h || !Array.isArray(h.time)) {
    throw new WeatherProviderError("Open-Meteo returned unexpected response format: missing hourly.time array");
  }
  return h.time.map((t, i) => ({
    forecast_hour_utc: t,
    temperature_2m_c: h.temperature_2m[i] ?? null,
    relative_humidity_2m_pct: h.relative_humidity_2m[i] ?? null,
    dew_point_2m_c: h.dew_point_2m[i] ?? null,
    precipitation_probability_pct: h.precipitation_probability[i] ?? null,
    precipitation_mm: h.precipitation[i] ?? null,
    weather_code: h.weather_code[i] ?? null,
    cloud_cover_pct: h.cloud_cover[i] ?? null,
    cloud_cover_low_pct: h.cloud_cover_low[i] ?? null,
    cloud_cover_mid_pct: h.cloud_cover_mid[i] ?? null,
    cloud_cover_high_pct: h.cloud_cover_high[i] ?? null,
    visibility_m: h.visibility[i] ?? null,
    wind_speed_10m_kmh: h.wind_speed_10m[i] ?? null,
    wind_gusts_10m_kmh: h.wind_gusts_10m[i] ?? null,
  }));
}

export function normalizeResponse(
  raw: WeatherProviderResponse | WeatherProviderResponse[],
): WeatherHourlyData[][] {
  const responses = Array.isArray(raw) ? raw : [raw];
  return responses.map(normalizeSingleLocation);
}

export async function fetchForecast(
  coords: { lat: number; lon: number }[],
  days?: number,
): Promise<WeatherHourlyData[][]> {
  const url = buildOpenMeteoUrl(coords, days);

  let res: Response;
  try {
    res = await fetch(url);
  } catch (err) {
    throw new WeatherProviderError("Failed to fetch weather data", { cause: err });
  }

  if (!res.ok) {
    throw new WeatherProviderError(
      `Open-Meteo HTTP ${res.status}: ${res.statusText}`,
    );
  }

  const raw = (await res.json()) as WeatherProviderResponse | WeatherProviderResponse[];
  return normalizeResponse(raw);
}
