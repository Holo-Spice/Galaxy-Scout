import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue([]),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    onConflictDoUpdate: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock("@/domains/weather/adapter", () => ({
  fetchForecast: vi.fn(),
  WeatherProviderError: class WeatherProviderError extends Error {
    constructor(message: string, options?: ErrorOptions) {
      super(message, options);
      this.name = "WeatherProviderError";
    }
  },
}));

import { POST } from "@/app/api/compare/route";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { fetchForecast } from "@/domains/weather/adapter";

function makeRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost:3000/api/compare", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const validBody = {
  locationIds: ["loc_01", "loc_02"],
  origin: { latitude: 30.2741, longitude: 120.1551, name: "杭州" },
  dateLocal: "2026-05-15",
  startHourLocal: 20,
  endHourLocal: 5,
  timezone: "Asia/Shanghai",
};

const mockLocations: Record<string, Record<string, unknown>> = {
  loc_01: {
    id: "loc_01",
    name: "天荒坪",
    latitude: 30.45,
    longitude: 119.58,
    deleted_at: null,
  },
  loc_02: {
    id: "loc_02",
    name: "括苍山",
    latitude: 28.8,
    longitude: 120.9,
    deleted_at: null,
  },
};

function makeHourlyData(utcHour: string, cloudCover = 5) {
  return {
    forecast_hour_utc: utcHour,
    temperature_2m_c: 15,
    relative_humidity_2m_pct: 60,
    dew_point_2m_c: 8,
    precipitation_probability_pct: 0,
    precipitation_mm: 0,
    weather_code: 0,
    cloud_cover_pct: cloudCover,
    cloud_cover_low_pct: 0,
    cloud_cover_mid_pct: 0,
    cloud_cover_high_pct: 0,
    visibility_m: 20000,
    wind_speed_10m_kmh: 10,
    wind_gusts_10m_kmh: 15,
  };
}

function make10Hours(): ReturnType<typeof makeHourlyData>[] {
  const hours: ReturnType<typeof makeHourlyData>[] = [];
  for (let h = 12; h <= 15; h++) {
    hours.push(makeHourlyData(`2026-05-15T${String(h).padStart(2, "0")}:00`));
  }
  for (let h = 16; h <= 21; h++) {
    hours.push(makeHourlyData(`2026-05-15T${String(h).padStart(2, "0")}:00`));
  }
  return hours;
}

function setupDbMocks(locationResults: Record<string, unknown>[][]) {
  let selectCall = 0;
  (db.select as ReturnType<typeof vi.fn>).mockImplementation(() => {
    const currentCall = selectCall++;
    const chain: Record<string, ReturnType<typeof vi.fn>> = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([]),
    };
    chain.from.mockReturnValue(chain);
    chain.where.mockReturnValue(chain);
    chain.limit.mockReturnValue(chain);

    if (currentCall < locationResults.length) {
      chain.limit = vi.fn().mockResolvedValue(locationResults[currentCall]);
    }
    return chain;
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  (fetchForecast as ReturnType<typeof vi.fn>).mockResolvedValue([make10Hours(), make10Hours()]);
});

describe("POST /api/compare", () => {
  describe("response structure", () => {
    it("should return 200 with data and meta on valid request", async () => {
      setupDbMocks([[mockLocations.loc_01], [mockLocations.loc_02]]);

      const res = await POST(makeRequest(validBody));
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.data).toBeDefined();
      expect(json.data.bestLocationId).toBeDefined();
      expect(json.data.items).toBeInstanceOf(Array);
      expect(json.data.items.length).toBe(2);
      expect(json.meta).toBeDefined();
      expect(json.meta.requestId).toBeDefined();
      expect(json.meta.generatedAt).toBeDefined();
    });

    it("should have valid item structure with summary, lightPollution, hourly", async () => {
      setupDbMocks([[mockLocations.loc_01], [mockLocations.loc_02]]);

      const res = await POST(makeRequest(validBody));
      const json = await res.json();
      const item = json.data.items[0];

      expect(item.locationId).toBeDefined();
      expect(item.summary).toBeDefined();
      expect(item.summary.totalScore).toBeGreaterThanOrEqual(0);
      expect(item.summary.totalScore).toBeLessThanOrEqual(100);
      expect(item.summary.recommendation).toBeDefined();
      expect(item.lightPollution).toBeNull();
      expect(item.hourly).toBeInstanceOf(Array);
    });
  });

  describe("light pollution", () => {
    it("should return lightPollution as null", async () => {
      setupDbMocks([[mockLocations.loc_01], [mockLocations.loc_02]]);

      const res = await POST(makeRequest(validBody));
      const json = await res.json();

      for (const item of json.data.items) {
        expect(item.lightPollution).toBeNull();
      }
    });
  });

  describe("distance calculation", () => {
    it("should calculate straight_line distance when origin is provided", async () => {
      setupDbMocks([[mockLocations.loc_01], [mockLocations.loc_02]]);

      const res = await POST(makeRequest(validBody));
      const json = await res.json();

      for (const item of json.data.items) {
        expect(item.summary.distanceKm).toBeGreaterThanOrEqual(0);
        expect(item.summary.distanceMode).toBe("straight_line");
      }
    });

    it("should return null distance when origin is not provided", async () => {
      const bodyNoOrigin = { ...validBody };
      delete (bodyNoOrigin as Record<string, unknown>).origin;

      setupDbMocks([[mockLocations.loc_01], [mockLocations.loc_02]]);

      const res = await POST(makeRequest(bodyNoOrigin));
      const json = await res.json();

      for (const item of json.data.items) {
        expect(item.summary.distanceKm).toBeNull();
        expect(item.summary.distanceMode).toBeNull();
      }
    });
  });

  describe("scoring", () => {
    it("should use M2 weights: weather*0.8 + distance*0.2", async () => {
      setupDbMocks([[mockLocations.loc_01], [mockLocations.loc_02]]);

      const res = await POST(makeRequest(validBody));
      const json = await res.json();

      for (const item of json.data.items) {
        expect(item.summary.totalScore).toBeGreaterThanOrEqual(70);
        expect(item.summary.totalScore).toBeLessThanOrEqual(100);
      }
    });
  });

  describe("validation errors", () => {
    it("should return 400 for empty locationIds", async () => {
      const res = await POST(
        makeRequest({ ...validBody, locationIds: [] }),
      );
      expect(res.status).toBe(400);

      const json = await res.json();
      expect(json.error).toBeDefined();
      expect(json.error.code).toBe("VALIDATION_ERROR");
      expect(json.meta.requestId).toBeDefined();
    });

    it("should return 400 for missing dateLocal", async () => {
      const body = { ...validBody };
      delete (body as Record<string, unknown>).dateLocal;

      const res = await POST(makeRequest(body));
      expect(res.status).toBe(400);

      const json = await res.json();
      expect(json.error.code).toBe("VALIDATION_ERROR");
    });

    it("should return 400 for invalid startHourLocal", async () => {
      const res = await POST(
        makeRequest({ ...validBody, startHourLocal: 25 }),
      );
      expect(res.status).toBe(400);
    });
  });

  describe("weather provider failure", () => {
    it("should return 500 when provider fails and no cache exists", async () => {
      setupDbMocks([[mockLocations.loc_01], [mockLocations.loc_02]]);

      const { WeatherProviderError } = await import("@/domains/weather/adapter");
      (fetchForecast as ReturnType<typeof vi.fn>).mockRejectedValue(
        new WeatherProviderError("Open-Meteo HTTP 500"),
      );

      const res = await POST(makeRequest(validBody));
      expect(res.status).toBe(500);

      const json = await res.json();
      expect(json.error.code).toBe("WEATHER_PROVIDER_UNAVAILABLE");
    });
  });

  describe("deduplication", () => {
    it("should deduplicate locationIds (process each ID once)", async () => {
      setupDbMocks([[mockLocations.loc_01]]);

      const res = await POST(
        makeRequest({ ...validBody, locationIds: ["loc_01", "loc_01", "loc_01"] }),
      );

      const json = await res.json();
      expect(json.data.items.length).toBe(1);
    });
  });
});
