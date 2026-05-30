import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue([]),
  },
}));

import { queryLightPollution } from "./query";
import { clearLightPollutionCache } from "./cache";
import { db } from "@/lib/db";

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

describe("queryLightPollution", () => {
  beforeEach(() => {
    clearLightPollutionCache();
    vi.clearAllMocks();
  });

  it("returns valid LightQueryResult for known coordinate (38.6, 106.0)", async () => {
    mockDbQuery([
      {
        latitude: 38.6,
        longitude: 106.0,
        viirs_radiance: 1.2,
        darkness_class: 2,
        sqm_estimate: 21.5,
        bortle_estimate: 3,
        source: "viirs-2024",
        source_year: 2024,
      },
    ]);

    const result = await queryLightPollution(38.6, 106.0);

    expect(result.radiance).toBe(1.2);
    expect(result.darknessClass).toBe(2);
    expect(result.sqmEstimate).toBe(21.5);
    expect(result.bortleEstimate).toBe(3);
    expect(result.source).toBe("viirs-2024");
    expect(result.sourceYear).toBe(2024);
    expect(result.confidence).toBe("medium");
  });

  it("returns null values and unknown confidence for coordinate outside data coverage (0, 0)", async () => {
    mockDbQuery([]);

    const result = await queryLightPollution(0, 0);

    expect(result.radiance).toBeNull();
    expect(result.darknessClass).toBeNull();
    expect(result.sqmEstimate).toBeNull();
    expect(result.bortleEstimate).toBeNull();
    expect(result.source).toBe("none");
    expect(result.sourceYear).toBe(0);
    expect(result.confidence).toBe("unknown");
  });

  it("returns null values gracefully when DB has no data (no exception)", async () => {
    mockDbQuery([]);

    const result = await queryLightPollution(999, 999);

    expect(result.radiance).toBeNull();
    expect(result.darknessClass).toBeNull();
    expect(result.sqmEstimate).toBeNull();
    expect(result.bortleEstimate).toBeNull();
    expect(result.source).toBe("none");
    expect(result.sourceYear).toBe(0);
    expect(result.confidence).toBe("unknown");
  });

  it("maps DB row fields correctly to LightQueryResult", async () => {
    mockDbQuery([
      {
        latitude: 30.0,
        longitude: 120.0,
        viirs_radiance: 0.3,
        darkness_class: 1,
        sqm_estimate: 22.0,
        bortle_estimate: 2,
        source: "viirs-2023",
        source_year: 2023,
      },
    ]);

    const result = await queryLightPollution(30.0, 120.0);

    expect(result.radiance).toBe(0.3);
    expect(result.darknessClass).toBe(1);
    expect(result.sqmEstimate).toBe(22.0);
    expect(result.bortleEstimate).toBe(2);
    expect(result.source).toBe("viirs-2023");
    expect(result.sourceYear).toBe(2023);
    expect(result.confidence).toBe("medium");
  });

  it("handles DB row with null optional fields", async () => {
    mockDbQuery([
      {
        latitude: 40.0,
        longitude: 116.0,
        viirs_radiance: null,
        darkness_class: null,
        sqm_estimate: null,
        bortle_estimate: null,
        source: "viirs-2024",
        source_year: 2024,
      },
    ]);

    const result = await queryLightPollution(40.0, 116.0);

    expect(result.radiance).toBeNull();
    expect(result.darknessClass).toBeNull();
    expect(result.sqmEstimate).toBeNull();
    expect(result.bortleEstimate).toBeNull();
    expect(result.source).toBe("viirs-2024");
    expect(result.sourceYear).toBe(2024);
  });
});
