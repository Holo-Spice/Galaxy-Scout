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

import { getCachedAstronomy, upsertAstronomyCache } from "./cache";
import type { AstronomyHourlyData } from "./types";

beforeAll(() => {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS astronomy_hourly_cache (
      id TEXT PRIMARY KEY,
      location_hash TEXT NOT NULL,
      hour_utc TEXT NOT NULL,
      sun_altitude_deg REAL,
      moon_altitude_deg REAL,
      moon_illumination_pct REAL,
      moon_phase_name TEXT,
      galactic_center_altitude_deg REAL,
      is_astronomical_night INTEGER,
      fetched_at TEXT NOT NULL,
      expires_at TEXT NOT NULL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS astronomy_hourly_cache_loc_hour_idx
      ON astronomy_hourly_cache (location_hash, hour_utc);
    CREATE INDEX IF NOT EXISTS astronomy_hourly_cache_expires_at_idx
      ON astronomy_hourly_cache (expires_at);
  `);
});

function makeAstronomy(overrides?: Partial<AstronomyHourlyData>): AstronomyHourlyData {
  return {
    hour_utc: "2026-06-01T22:00",
    sun_altitude_deg: -25,
    moon_altitude_deg: 45,
    moon_illumination_pct: 75,
    moon_phase_name: "waxing gibbous",
    galactic_center_altitude_deg: 30,
    is_astronomical_night: true,
    ...overrides,
  };
}

describe("getCachedAstronomy", () => {
  beforeEach(() => {
    sqlite.exec("DELETE FROM astronomy_hourly_cache");
  });

  it("returns null when no cache exists", async () => {
    const result = await getCachedAstronomy("30,120", "2026-06-01T22:00");
    expect(result).toBeNull();
  });

  it("returns cached data when not expired", async () => {
    const data = makeAstronomy();
    await upsertAstronomyCache("30,120", [data]);

    const result = await getCachedAstronomy("30,120", "2026-06-01T22:00");
    expect(result).not.toBeNull();
    expect(result!.hour_utc).toBe("2026-06-01T22:00");
    expect(result!.sun_altitude_deg).toBe(-25);
    expect(result!.moon_illumination_pct).toBe(75);
    expect(result!.is_astronomical_night).toBe(true);
  });

  it("returns null for expired cache", async () => {
    // Insert directly with expired timestamp
    sqlite.exec(`
      INSERT INTO astronomy_hourly_cache (id, location_hash, hour_utc, sun_altitude_deg, moon_altitude_deg, moon_illumination_pct, moon_phase_name, galactic_center_altitude_deg, is_astronomical_night, fetched_at, expires_at)
      VALUES ('test-id', '30,120', '2026-06-01T22:00', -25, 45, 75, 'waxing gibbous', 30, 1, '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z')
    `);

    const result = await getCachedAstronomy("30,120", "2026-06-01T22:00");
    expect(result).toBeNull();
  });

  it("returns null for different location hash", async () => {
    const data = makeAstronomy();
    await upsertAstronomyCache("30,120", [data]);

    const result = await getCachedAstronomy("40,130", "2026-06-01T22:00");
    expect(result).toBeNull();
  });
});

describe("upsertAstronomyCache", () => {
  beforeEach(() => {
    sqlite.exec("DELETE FROM astronomy_hourly_cache");
  });

  it("upsert is idempotent (no duplicate rows)", async () => {
    const data = makeAstronomy();

    await upsertAstronomyCache("30,120", [data]);
    await upsertAstronomyCache("30,120", [data]);

    const rows = sqlite.prepare("SELECT * FROM astronomy_hourly_cache WHERE location_hash = ? AND hour_utc = ?").all("30,120", "2026-06-01T22:00");
    expect(rows).toHaveLength(1);
  });

  it("stores multiple hours", async () => {
    const hour1 = makeAstronomy({ hour_utc: "2026-06-01T22:00" });
    const hour2 = makeAstronomy({ hour_utc: "2026-06-01T23:00" });

    await upsertAstronomyCache("30,120", [hour1, hour2]);

    const rows = sqlite.prepare("SELECT * FROM astronomy_hourly_cache WHERE location_hash = ?").all("30,120");
    expect(rows).toHaveLength(2);
  });

  it("updates existing row on conflict", async () => {
    const data = makeAstronomy({ sun_altitude_deg: -20 });
    await upsertAstronomyCache("30,120", [data]);

    const updated = makeAstronomy({ sun_altitude_deg: -30 });
    await upsertAstronomyCache("30,120", [updated]);

    const result = await getCachedAstronomy("30,120", "2026-06-01T22:00");
    expect(result!.sun_altitude_deg).toBe(-30);
  });

  it("sets expires_at ~24h in the future", async () => {
    const before = Date.now();
    const data = makeAstronomy();
    await upsertAstronomyCache("30,120", [data]);

    const row = sqlite.prepare("SELECT expires_at FROM astronomy_hourly_cache WHERE location_hash = ? AND hour_utc = ?").get("30,120", "2026-06-01T22:00") as { expires_at: string };
    const expiresAt = new Date(row.expires_at).getTime();

    const expectedTtl = 24 * 60 * 60 * 1000;
    // Allow 5s tolerance
    expect(expiresAt).toBeGreaterThanOrEqual(before + expectedTtl - 5000);
    expect(expiresAt).toBeLessThanOrEqual(before + expectedTtl + 5000);
  });
});
