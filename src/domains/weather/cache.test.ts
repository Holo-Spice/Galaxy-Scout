import { describe, it, expect, beforeAll, beforeEach } from "vitest";

const { sqlite, testDb } = vi.hoisted(() => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const BetterSqlite3 = require("better-sqlite3");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { drizzle } = require("drizzle-orm/better-sqlite3");
  const s = new BetterSqlite3(":memory:");
  const d = drizzle(s);
  return { sqlite: s, testDb: d };
});

vi.mock("@/lib/db", () => ({ db: testDb, sqlite }));

import { getCacheTTL, getCachedWeatherOrDefault, upsertWeatherCache } from "./cache";
import type { WeatherHourlyData } from "./types";

beforeAll(() => {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS weather_hourly_cache (
      id TEXT PRIMARY KEY,
      location_hash TEXT NOT NULL,
      provider TEXT NOT NULL DEFAULT 'open-meteo',
      forecast_hour_utc TEXT NOT NULL,
      fetched_at TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      temperature_2m_c REAL,
      relative_humidity_2m_pct REAL,
      dew_point_2m_c REAL,
      precipitation_probability_pct REAL,
      precipitation_mm REAL,
      cloud_cover_pct REAL,
      cloud_cover_low_pct REAL,
      cloud_cover_mid_pct REAL,
      cloud_cover_high_pct REAL,
      visibility_m REAL,
      wind_speed_10m_kmh REAL,
      wind_gusts_10m_kmh REAL,
      weather_code REAL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS weather_hourly_cache_loc_hour_idx
      ON weather_hourly_cache (location_hash, forecast_hour_utc);
    CREATE INDEX IF NOT EXISTS weather_hourly_cache_expires_at_idx
      ON weather_hourly_cache (expires_at);
    CREATE INDEX IF NOT EXISTS weather_hourly_cache_loc_provider_idx
      ON weather_hourly_cache (location_hash, provider);
  `);
});

function makeHourly(overrides?: Partial<WeatherHourlyData>): WeatherHourlyData {
  return {
    forecast_hour_utc: "2026-06-01T12:00",
    temperature_2m_c: 25.0,
    relative_humidity_2m_pct: 60,
    dew_point_2m_c: 16.0,
    precipitation_probability_pct: 10,
    precipitation_mm: 0,
    cloud_cover_pct: 30,
    cloud_cover_low_pct: 10,
    cloud_cover_mid_pct: 10,
    cloud_cover_high_pct: 10,
    visibility_m: 10000,
    wind_speed_10m_kmh: 15,
    wind_gusts_10m_kmh: 25,
    weather_code: 1,
    ...overrides,
  };
}

describe("getCacheTTL", () => {
  const now = new Date("2026-06-01T00:00:00Z");

  it("未来 ≤72h → 60min", () => {
    const hour = new Date("2026-06-02T00:00:00Z");
    expect(getCacheTTL(hour, now)).toBe(60);
  });

  it("未来 =72h boundary → 60min", () => {
    const hour = new Date("2026-06-04T00:00:00Z");
    expect(getCacheTTL(hour, now)).toBe(60);
  });

  it("未来 >72h & ≤7d → 180min", () => {
    const hour = new Date("2026-06-06T00:00:00Z");
    expect(getCacheTTL(hour, now)).toBe(180);
  });

  it("未来 =7d boundary → 180min", () => {
    const hour = new Date("2026-06-08T00:00:00Z");
    expect(getCacheTTL(hour, now)).toBe(180);
  });

  it("未来 >7d & ≤16d → 360min", () => {
    const hour = new Date("2026-06-11T00:00:00Z");
    expect(getCacheTTL(hour, now)).toBe(360);
  });

  it("未来 =16d boundary → 360min", () => {
    const hour = new Date("2026-06-17T00:00:00Z");
    expect(getCacheTTL(hour, now)).toBe(360);
  });

  it("未来 >16d → 720min", () => {
    const hour = new Date("2026-06-21T00:00:00Z");
    expect(getCacheTTL(hour, now)).toBe(720);
  });
});

describe("upsertWeatherCache", () => {
  beforeEach(() => {
    sqlite.exec("DELETE FROM weather_hourly_cache");
  });

  it("写入单条记录", async () => {
    const data = [makeHourly({ forecast_hour_utc: "2026-06-01T12:00" })];
    await upsertWeatherCache("loc1", "open-meteo", data);

    const rows = sqlite.prepare("SELECT * FROM weather_hourly_cache WHERE location_hash = ?").all("loc1");
    expect(rows).toHaveLength(1);
    expect(rows[0].location_hash).toBe("loc1");
    expect(rows[0].provider).toBe("open-meteo");
    expect(rows[0].forecast_hour_utc).toBe("2026-06-01T12:00");
    expect(rows[0].temperature_2m_c).toBe(25.0);
  });

  it("批量写入多条记录", async () => {
    const data = [
      makeHourly({ forecast_hour_utc: "2026-06-01T12:00" }),
      makeHourly({ forecast_hour_utc: "2026-06-01T13:00", temperature_2m_c: 26.0 }),
      makeHourly({ forecast_hour_utc: "2026-06-01T14:00", temperature_2m_c: 27.0 }),
    ];
    await upsertWeatherCache("loc2", "open-meteo", data);

    const rows = sqlite.prepare("SELECT * FROM weather_hourly_cache WHERE location_hash = ?").all("loc2");
    expect(rows).toHaveLength(3);
  });

  it("重复 upsert 不产生重复行（唯一索引）", async () => {
    const data = [makeHourly({ forecast_hour_utc: "2026-06-01T12:00", temperature_2m_c: 20.0 })];
    await upsertWeatherCache("loc3", "open-meteo", data);

    const data2 = [makeHourly({ forecast_hour_utc: "2026-06-01T12:00", temperature_2m_c: 30.0 })];
    await upsertWeatherCache("loc3", "open-meteo", data2);

    const rows = sqlite.prepare("SELECT * FROM weather_hourly_cache WHERE location_hash = ?").all("loc3");
    expect(rows).toHaveLength(1);
    expect(rows[0].temperature_2m_c).toBe(30.0);
  });

  it("计算 expires_at = fetched_at + TTL", async () => {
    const soon = new Date(Date.now() + 36 * 60 * 60 * 1000);
    const hh = soon.toISOString().slice(0, 16);
    const data = [makeHourly({ forecast_hour_utc: hh })];
    await upsertWeatherCache("loc4", "open-meteo", data);

    const row = sqlite.prepare("SELECT fetched_at, expires_at FROM weather_hourly_cache WHERE location_hash = ?").get("loc4") as any;
    const fetched = new Date(row.fetched_at).getTime();
    const expires = new Date(row.expires_at).getTime();
    const diffMin = (expires - fetched) / (1000 * 60);
    expect(diffMin).toBe(60);
  });
});

describe("getCachedWeatherOrDefault", () => {
  beforeEach(() => {
    sqlite.exec("DELETE FROM weather_hourly_cache");
  });

  it("无任何记录 → {data: null, stale: false}", async () => {
    const result = await getCachedWeatherOrDefault("unknown_loc", "2026-06-01T12:00");
    expect(result.data).toBeNull();
    expect(result.stale).toBe(false);
  });

  it("有未过期记录 → 返回 data, stale=false", async () => {
    const futureExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    sqlite.prepare(`
      INSERT INTO weather_hourly_cache (id, location_hash, provider, forecast_hour_utc, fetched_at, expires_at, temperature_2m_c)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run("test-id-1", "loc_valid", "open-meteo", "2026-06-01T12:00", new Date().toISOString(), futureExpiry, 22.5);

    const result = await getCachedWeatherOrDefault("loc_valid", "2026-06-01T12:00");
    expect(result.data).not.toBeNull();
    expect(result.data!.temperature_2m_c).toBe(22.5);
    expect(result.stale).toBe(false);
  });

  it("有过期记录 → 返回过期 data, stale=true", async () => {
    const pastExpiry = new Date(Date.now() - 60 * 1000).toISOString();
    sqlite.prepare(`
      INSERT INTO weather_hourly_cache (id, location_hash, provider, forecast_hour_utc, fetched_at, expires_at, temperature_2m_c)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run("test-id-2", "loc_stale", "open-meteo", "2026-06-01T12:00", new Date(Date.now() - 3600 * 1000).toISOString(), pastExpiry, 18.0);

    const result = await getCachedWeatherOrDefault("loc_stale", "2026-06-01T12:00");
    expect(result.data).not.toBeNull();
    expect(result.data!.temperature_2m_c).toBe(18.0);
    expect(result.stale).toBe(true);
  });

  it("upsert 替换过期记录后返回未过期", async () => {
    const pastExpiry = new Date(Date.now() - 60 * 1000).toISOString();
    sqlite.prepare(`
      INSERT INTO weather_hourly_cache (id, location_hash, provider, forecast_hour_utc, fetched_at, expires_at, temperature_2m_c)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run("test-id-3a", "loc_mixed", "open-meteo", "2026-06-01T12:00", new Date(Date.now() - 3600 * 1000).toISOString(), pastExpiry, 10.0);

    const staleResult = await getCachedWeatherOrDefault("loc_mixed", "2026-06-01T12:00");
    expect(staleResult.stale).toBe(true);
    expect(staleResult.data!.temperature_2m_c).toBe(10.0);

    await upsertWeatherCache("loc_mixed", "open-meteo", [makeHourly({ forecast_hour_utc: "2026-06-01T12:00", temperature_2m_c: 20.0 })]);

    const freshResult = await getCachedWeatherOrDefault("loc_mixed", "2026-06-01T12:00");
    expect(freshResult.stale).toBe(false);
    expect(freshResult.data!.temperature_2m_c).toBe(20.0);
  });
});
