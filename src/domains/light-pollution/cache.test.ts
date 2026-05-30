import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue([]),
  },
}));

import {
  getCachedLightPollution,
  setCachedLightPollution,
  clearLightPollutionCache,
} from "./cache";
import { queryLightPollution } from "./query";
import { db } from "@/lib/db";
import type { LightQueryResult } from "./types";

const SAMPLE_RESULT: LightQueryResult = {
  radiance: 1.5,
  darknessClass: 2,
  sqmEstimate: 21.3,
  bortleEstimate: 3,
  source: "viirs-2024",
  sourceYear: 2024,
  confidence: "medium",
};

const SAMPLE_DB_ROW = {
  latitude: 38.6,
  longitude: 106.0,
  viirs_radiance: 1.5,
  darkness_class: 2,
  sqm_estimate: 21.3,
  bortle_estimate: 3,
  source: "viirs-2024",
  source_year: 2024,
};

function mockDbQuery(rows: unknown[]) {
  const chain = {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue(rows),
  };
  (db.select as ReturnType<typeof vi.fn>).mockReturnValue(chain);
  return chain;
}

describe("light pollution in-memory cache", () => {
  beforeEach(() => {
    clearLightPollutionCache();
    vi.clearAllMocks();
  });

  it("first query hits DB, second query returns cached result", async () => {
    mockDbQuery([SAMPLE_DB_ROW]);

    const first = await queryLightPollution(38.6, 106.0);
    expect(first.radiance).toBe(1.5);
    expect(first.source).toBe("viirs-2024");

    const second = await queryLightPollution(38.6, 106.0);
    expect(second.radiance).toBe(1.5);
    expect(second.source).toBe("viirs-2024");

    expect(db.select).toHaveBeenCalledTimes(1);
  });

  it("cache key uses location_hash not raw lat/lon", () => {
    const hash = "38.6000,106.0000";
    setCachedLightPollution(hash, SAMPLE_RESULT);

    expect(getCachedLightPollution(hash)).toEqual(SAMPLE_RESULT);

    expect(getCachedLightPollution("38.6001,106.0001")).toBeUndefined();

    expect(getCachedLightPollution("38.6,106")).toBeUndefined();
  });
});
