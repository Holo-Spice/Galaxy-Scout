import { describe, it, expect } from "vitest";
import { scoreAstronomyHourly } from "./astronomy-scoring";
import type { AstronomyHourlyData } from "../astronomy/types";

function makeAstronomy(overrides: Partial<AstronomyHourlyData> = {}): AstronomyHourlyData {
  return {
    hour_utc: "2026-01-15T02:00",
    sun_altitude_deg: -30,
    moon_altitude_deg: -20,
    moon_illumination_pct: 0,
    moon_phase_name: "new_moon",
    galactic_center_altitude_deg: 25,
    is_astronomical_night: true,
    ...overrides,
  };
}

describe("scoreAstronomyHourly", () => {
  it("astronomical night with clear sky and high GC returns high score and recommended", () => {
    const result = scoreAstronomyHourly(makeAstronomy({
      is_astronomical_night: true,
      moon_altitude_deg: -10,
      moon_illumination_pct: 0,
      galactic_center_altitude_deg: 25,
    }));
    expect(result.score).toBeGreaterThanOrEqual(80);
    expect(result.recommendation).toBe("recommended");
    expect(result.reasons).toContain("天文夜");
    expect(result.reasons).toContain("月亮已落");
    expect(result.reasons).toContain("银河可见");
  });

  it("non-astronomical night returns score 40 and watch", () => {
    const result = scoreAstronomyHourly(makeAstronomy({
      is_astronomical_night: false,
      sun_altitude_deg: -10,
      moon_altitude_deg: -10,
      galactic_center_altitude_deg: 5,
    }));
    expect(result.score).toBe(40);
    expect(result.recommendation).toBe("watch");
    expect(result.risks).toContain("非天文夜");
  });

  it("moon high with illumination >10% applies penalty", () => {
    const result = scoreAstronomyHourly(makeAstronomy({
      is_astronomical_night: true,
      moon_altitude_deg: 60,
      moon_illumination_pct: 80,
      galactic_center_altitude_deg: 5,
    }));
    expect(result.score).toBeLessThan(80);
    expect(result.risks).toContain("月光强烈");
  });

  it("GC altitude >=20 gives +20 bonus", () => {
    const result = scoreAstronomyHourly(makeAstronomy({
      is_astronomical_night: true,
      moon_altitude_deg: -10,
      galactic_center_altitude_deg: 25,
    }));
    expect(result.reasons).toContain("银河可见");
    expect(result.score).toBeGreaterThanOrEqual(90);
  });

  it("GC altitude <10 gives no bonus", () => {
    const result = scoreAstronomyHourly(makeAstronomy({
      is_astronomical_night: true,
      moon_altitude_deg: -10,
      galactic_center_altitude_deg: 5,
    }));
    expect(result.reasons).not.toContain("银河可见");
    expect(result.score).toBeLessThan(90);
  });

  it("moon below horizon gives no penalty", () => {
    const result = scoreAstronomyHourly(makeAstronomy({
      is_astronomical_night: true,
      moon_altitude_deg: -5,
      moon_illumination_pct: 90,
      galactic_center_altitude_deg: 25,
    }));
    expect(result.risks).not.toContain("月光强烈");
    expect(result.reasons).toContain("月亮已落");
  });

  it("score is clamped between 0 and 100", () => {
    const best = scoreAstronomyHourly(makeAstronomy({
      is_astronomical_night: true,
      moon_altitude_deg: -10,
      galactic_center_altitude_deg: 30,
    }));
    expect(best.score).toBeLessThanOrEqual(100);

    const worst = scoreAstronomyHourly(makeAstronomy({
      is_astronomical_night: false,
      moon_altitude_deg: 90,
      moon_illumination_pct: 100,
      galactic_center_altitude_deg: 0,
    }));
    expect(worst.score).toBeGreaterThanOrEqual(0);
  });

  it("missing fields do not throw", () => {
    const partial = {
      hour_utc: "2026-01-15T02:00",
      sun_altitude_deg: -30,
      moon_altitude_deg: undefined as unknown as number,
      moon_illumination_pct: undefined as unknown as number,
      moon_phase_name: "",
      galactic_center_altitude_deg: undefined as unknown as number,
      is_astronomical_night: true,
    } as AstronomyHourlyData;
    expect(() => scoreAstronomyHourly(partial)).not.toThrow();
  });

  it("watch recommendation when score between 40 and 59", () => {
    const result = scoreAstronomyHourly(makeAstronomy({
      is_astronomical_night: false,
      sun_altitude_deg: -15,
      moon_altitude_deg: -10,
      galactic_center_altitude_deg: 15,
    }));
    if (result.score >= 40 && result.score < 60) {
      expect(result.recommendation).toBe("watch");
    }
  });

  it("non-astronomical night with high moon is not_recommended", () => {
    const result = scoreAstronomyHourly(makeAstronomy({
      is_astronomical_night: false,
      sun_altitude_deg: -10,
      moon_altitude_deg: 50,
      moon_illumination_pct: 60,
      galactic_center_altitude_deg: 5,
    }));
    expect(result.recommendation).toBe("not_recommended");
    expect(result.risks).toContain("非天文夜");
  });
});
