// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  buildOpenMeteoUrl,
  normalizeResponse,
  fetchForecast,
  WeatherProviderError,
} from "./adapter";
import type { WeatherProviderResponse } from "./types";

describe("buildOpenMeteoUrl", () => {
  const BASE = "https://api.open-meteo.com/v1/forecast";

  it("builds correct URL for a single coordinate", () => {
    const url = buildOpenMeteoUrl([{ lat: 30.0, lon: 120.0 }]);
    expect(url).toContain(`${BASE}?`);
    expect(url).toContain("latitude=30");
    expect(url).toContain("longitude=120");
    expect(url).toContain("hourly=temperature_2m");
    expect(url).toContain("timezone=GMT");
    expect(url).toContain("wind_speed_unit=kmh");
    expect(url).toContain("precipitation_unit=mm");
    expect(url).toContain("cell_selection=land");
    expect(url).toContain("forecast_days=7");
  });

  it("merges multiple coordinates into comma-separated lat/lon", () => {
    const url = buildOpenMeteoUrl([
      { lat: 30.0, lon: 120.0 },
      { lat: 31.0, lon: 121.0 },
      { lat: 32.5, lon: 117.8 },
    ]);
    expect(url).toContain("latitude=30,31,32.5");
    expect(url).toContain("longitude=120,121,117.8");
  });

  it("respects custom forecast_days parameter", () => {
    const url = buildOpenMeteoUrl([{ lat: 10, lon: 20 }], 3);
    expect(url).toContain("forecast_days=3");
  });

  it("throws Error for empty coordinates array", () => {
    expect(() => buildOpenMeteoUrl([])).toThrow("at least one coordinate");
  });

  it("includes all required hourly fields", () => {
    const url = buildOpenMeteoUrl([{ lat: 0, lon: 0 }]);
    const hourlyFields = [
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
    ];
    for (const field of hourlyFields) {
      expect(url).toContain(field);
    }
  });
});

describe("normalizeResponse", () => {
  const makeResponse = (hours: number): WeatherProviderResponse => ({
    hourly: {
      time: Array.from({ length: hours }, (_, i) => `2025-01-01T${String(i).padStart(2, "0")}:00`),
      temperature_2m: Array.from({ length: hours }, () => 20),
      relative_humidity_2m: Array.from({ length: hours }, () => 60),
      dew_point_2m: Array.from({ length: hours }, () => 12),
      precipitation_probability: Array.from({ length: hours }, () => 10),
      precipitation: Array.from({ length: hours }, () => 0.5),
      weather_code: Array.from({ length: hours }, () => 1),
      cloud_cover: Array.from({ length: hours }, () => 30),
      cloud_cover_low: Array.from({ length: hours }, () => 10),
      cloud_cover_mid: Array.from({ length: hours }, () => 10),
      cloud_cover_high: Array.from({ length: hours }, () => 10),
      visibility: Array.from({ length: hours }, () => 10000),
      wind_speed_10m: Array.from({ length: hours }, () => 15),
      wind_gusts_10m: Array.from({ length: hours }, () => 25),
    },
  });

  it("maps Open-Meteo fields to internal field names for single response", () => {
    const raw = makeResponse(3);
    const result = normalizeResponse(raw);

    expect(result).toHaveLength(1);
    const hours = result[0];
    expect(hours).toHaveLength(3);
    expect(hours[0]).toEqual({
      forecast_hour_utc: "2025-01-01T00:00",
      temperature_2m_c: 20,
      relative_humidity_2m_pct: 60,
      dew_point_2m_c: 12,
      precipitation_probability_pct: 10,
      precipitation_mm: 0.5,
      weather_code: 1,
      cloud_cover_pct: 30,
      cloud_cover_low_pct: 10,
      cloud_cover_mid_pct: 10,
      cloud_cover_high_pct: 10,
      visibility_m: 10000,
      wind_speed_10m_kmh: 15,
      wind_gusts_10m_kmh: 25,
    });
  });

  it("fills missing fields with null instead of throwing", () => {
    const raw: WeatherProviderResponse = {
      hourly: {
        time: ["2025-06-01T12:00"],
        temperature_2m: [null],
        relative_humidity_2m: [null],
        dew_point_2m: [null],
        precipitation_probability: [null],
        precipitation: [null],
        weather_code: [null],
        cloud_cover: [null],
        cloud_cover_low: [null],
        cloud_cover_mid: [null],
        cloud_cover_high: [null],
        visibility: [null],
        wind_speed_10m: [null],
        wind_gusts_10m: [null],
      },
    };
    const result = normalizeResponse(raw);
    const hour = result[0][0];
    expect(hour.temperature_2m_c).toBeNull();
    expect(hour.visibility_m).toBeNull();
    expect(hour.forecast_hour_utc).toBe("2025-06-01T12:00");
  });

  it("splits multi-location array response into per-location arrays", () => {
    const loc1 = makeResponse(2);
    const loc2 = makeResponse(2);
    loc1.hourly.temperature_2m = [10, 11];
    loc2.hourly.temperature_2m = [20, 21];

    const result = normalizeResponse([loc1, loc2]);
    expect(result).toHaveLength(2);
    expect(result[0][0].temperature_2m_c).toBe(10);
    expect(result[0][1].temperature_2m_c).toBe(11);
    expect(result[1][0].temperature_2m_c).toBe(20);
    expect(result[1][1].temperature_2m_c).toBe(21);
  });

  it("handles zero-hour edge case", () => {
    const raw: WeatherProviderResponse = {
      hourly: {
        time: [],
        temperature_2m: [],
        relative_humidity_2m: [],
        dew_point_2m: [],
        precipitation_probability: [],
        precipitation: [],
        weather_code: [],
        cloud_cover: [],
        cloud_cover_low: [],
        cloud_cover_mid: [],
        cloud_cover_high: [],
        visibility: [],
        wind_speed_10m: [],
        wind_gusts_10m: [],
      },
    };
    const result = normalizeResponse(raw);
    expect(result).toHaveLength(1);
    expect(result[0]).toHaveLength(0);
  });
});

describe("WeatherProviderError", () => {
  it("is an instance of Error", () => {
    const err = new WeatherProviderError("test");
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(WeatherProviderError);
    expect(err.name).toBe("WeatherProviderError");
    expect(err.message).toBe("test");
  });

  it("can wrap a cause", () => {
    const cause = new Error("network down");
    const err = new WeatherProviderError("fetch failed", { cause });
    expect(err.cause).toBe(cause);
  });
});

describe("fetchForecast", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  const mockSuccessResponse = (data: WeatherProviderResponse | WeatherProviderResponse[]) => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(data),
    } as Response);
  };

  const mockNetworkError = () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new TypeError("Failed to fetch"));
  };

  const mockHttpError = () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      statusText: "Service Unavailable",
      json: () => Promise.resolve({}),
    } as Response);
  };

  it("returns normalized data on successful fetch", async () => {
    const raw: WeatherProviderResponse = {
      hourly: {
        time: ["2025-01-01T00:00"],
        temperature_2m: [15],
        relative_humidity_2m: [50],
        dew_point_2m: [5],
        precipitation_probability: [0],
        precipitation: [0],
        weather_code: [0],
        cloud_cover: [10],
        cloud_cover_low: [5],
        cloud_cover_mid: [3],
        cloud_cover_high: [2],
        visibility: [20000],
        wind_speed_10m: [10],
        wind_gusts_10m: [15],
      },
    };
    mockSuccessResponse(raw);

    const result = await fetchForecast([{ lat: 30, lon: 120 }]);
    expect(result).toHaveLength(1);
    expect(result[0][0].temperature_2m_c).toBe(15);
    expect(result[0][0].visibility_m).toBe(20000);
  });

  it("throws WeatherProviderError on network error", async () => {
    mockNetworkError();
    await expect(fetchForecast([{ lat: 30, lon: 120 }])).rejects.toThrow(
      WeatherProviderError,
    );
  });

  it("throws WeatherProviderError on HTTP error status", async () => {
    mockHttpError();
    await expect(fetchForecast([{ lat: 30, lon: 120 }])).rejects.toThrow(
      WeatherProviderError,
    );
  });

  it("calls fetch with the URL built by buildOpenMeteoUrl", async () => {
    const raw: WeatherProviderResponse = {
      hourly: {
        time: [],
        temperature_2m: [],
        relative_humidity_2m: [],
        dew_point_2m: [],
        precipitation_probability: [],
        precipitation: [],
        weather_code: [],
        cloud_cover: [],
        cloud_cover_low: [],
        cloud_cover_mid: [],
        cloud_cover_high: [],
        visibility: [],
        wind_speed_10m: [],
        wind_gusts_10m: [],
      },
    };
    mockSuccessResponse(raw);

    const coords = [
      { lat: 30.1234, lon: 120.5678 },
      { lat: 31.9876, lon: 121.1111 },
    ];
    await fetchForecast(coords, 5);

    const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>;
    const calledUrl = fetchMock.mock.calls[0][0] as string;
    expect(calledUrl).toContain("latitude=30.1234,31.9876");
    expect(calledUrl).toContain("longitude=120.5678,121.1111");
    expect(calledUrl).toContain("forecast_days=5");
  });
});
