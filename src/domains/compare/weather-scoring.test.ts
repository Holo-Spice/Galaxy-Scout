import { describe, it, expect } from "vitest";
import { scoreWeatherHourly } from "./weather-scoring";
import type { WeatherHourlyData } from "../weather/types";

function makeHourly(overrides: Partial<WeatherHourlyData> = {}): WeatherHourlyData {
  return {
    forecast_hour_utc: "2026-01-15T02:00",
    temperature_2m_c: 15,
    relative_humidity_2m_pct: 60,
    dew_point_2m_c: 7,
    precipitation_probability_pct: 0,
    precipitation_mm: 0,
    cloud_cover_pct: 0,
    cloud_cover_low_pct: 0,
    cloud_cover_mid_pct: 0,
    cloud_cover_high_pct: 0,
    visibility_m: 20000,
    wind_speed_10m_kmh: 10,
    wind_gusts_10m_kmh: 15,
    weather_code: 0,
    ...overrides,
  };
}

describe("scoreWeatherHourly", () => {
  it("returns score=100, recommended for perfect clear night", () => {
    const result = scoreWeatherHourly(makeHourly());
    expect(result.score).toBe(100);
    expect(result.recommendation).toBe("recommended");
    expect(result.risks).toHaveLength(0);
    expect(result.reasons.length).toBeGreaterThan(0);
  });

  it("deducts 5 per 10% cloud cover", () => {
    const result = scoreWeatherHourly(makeHourly({ cloud_cover_pct: 30 }));
    expect(result.score).toBe(85); // 100 - 15
  });

  it("caps cloud penalty at 50", () => {
    const result = scoreWeatherHourly(makeHourly({ cloud_cover_pct: 100 }));
    expect(result.score).toBe(50); // 100 - 50
  });

  it("adds high cloud penalty separately", () => {
    const result = scoreWeatherHourly(
      makeHourly({ cloud_cover_pct: 0, cloud_cover_high_pct: 30 })
    );
    expect(result.score).toBe(91); // 100 - floor(30/10)*3 = 100 - 9
  });

  it("deducts 8 per 10% precipitation probability", () => {
    const result = scoreWeatherHourly(
      makeHourly({ precipitation_probability_pct: 30 })
    );
    expect(result.score).toBe(76); // 100 - 24
  });

  it("caps precipitation probability penalty at 80", () => {
    const result = scoreWeatherHourly(
      makeHourly({ precipitation_probability_pct: 100 })
    );
    expect(result.score).toBe(20); // 100 - 80
  });

  it("deducts 15 when visibility < 10000m", () => {
    const result = scoreWeatherHourly(makeHourly({ visibility_m: 5000 }));
    expect(result.score).toBe(85); // 100 - 15
  });

  it("does not deduct when visibility >= 10000m", () => {
    const result = scoreWeatherHourly(makeHourly({ visibility_m: 10000 }));
    expect(result.score).toBe(100);
  });

  it("deducts 1 per km/h above 25, capped at 15", () => {
    const result = scoreWeatherHourly(makeHourly({ wind_speed_10m_kmh: 30 }));
    expect(result.score).toBe(95); // 100 - 5
  });

  it("caps wind penalty at 15", () => {
    const result = scoreWeatherHourly(makeHourly({ wind_speed_10m_kmh: 50 }));
    expect(result.score).toBe(85); // 100 - 15
  });

  it("does not deduct when wind <= 25", () => {
    const result = scoreWeatherHourly(makeHourly({ wind_speed_10m_kmh: 25 }));
    expect(result.score).toBe(100);
  });

  it("deducts 10 when humidity > 85%", () => {
    const result = scoreWeatherHourly(
      makeHourly({ relative_humidity_2m_pct: 90 })
    );
    expect(result.score).toBe(90); // 100 - 10
  });

  it("does not deduct when humidity <= 85%", () => {
    const result = scoreWeatherHourly(
      makeHourly({ relative_humidity_2m_pct: 85 })
    );
    expect(result.score).toBe(100);
  });

  it("floors score at 0", () => {
    const result = scoreWeatherHourly(
      makeHourly({
        cloud_cover_pct: 100,
        precipitation_probability_pct: 100,
        visibility_m: 1000,
        wind_speed_10m_kmh: 80,
        relative_humidity_2m_pct: 100,
      })
    );
    expect(result.score).toBe(0);
  });

  it("marks not_recommended when precipitation_mm > 0.5", () => {
    const result = scoreWeatherHourly(makeHourly({ precipitation_mm: 1.0 }));
    expect(result.recommendation).toBe("not_recommended");
    expect(result.risks).toEqual(
      expect.arrayContaining([expect.stringContaining("降水")])
    );
  });

  it("does NOT hard-mark when precipitation_mm <= 0.5", () => {
    const result = scoreWeatherHourly(makeHourly({ precipitation_mm: 0.5 }));
    expect(result.recommendation).not.toBe("not_recommended");
  });

  it("marks not_recommended when cloud > 70 AND high cloud > 50", () => {
    const result = scoreWeatherHourly(
      makeHourly({ cloud_cover_pct: 80, cloud_cover_high_pct: 60 })
    );
    expect(result.recommendation).toBe("not_recommended");
  });

  it("does NOT hard-mark when cloud > 70 but high cloud <= 50", () => {
    const result = scoreWeatherHourly(
      makeHourly({ cloud_cover_pct: 80, cloud_cover_high_pct: 40 })
    );
    expect(result.recommendation).not.toBe("not_recommended");
  });

  it("does NOT hard-mark when high cloud > 50 but total cloud <= 70", () => {
    const result = scoreWeatherHourly(
      makeHourly({ cloud_cover_pct: 70, cloud_cover_high_pct: 60 })
    );
    expect(result.recommendation).not.toBe("not_recommended");
  });

  it("returns watch for score 40-69", () => {
    const result = scoreWeatherHourly(makeHourly({ cloud_cover_pct: 70 }));
    expect(result.score).toBe(65); // 100 - 35
    expect(result.recommendation).toBe("watch");
  });

  it("returns not_recommended for score < 40 (without hard mark)", () => {
    const result = scoreWeatherHourly(
      makeHourly({
        cloud_cover_pct: 100,
        precipitation_probability_pct: 40,
        cloud_cover_high_pct: 0,
      })
    );
    expect(result.score).toBe(18); // 100 - 50 - 32
    expect(result.recommendation).toBe("not_recommended");
  });

  it("handles all-null fields without throwing", () => {
    const nullData: WeatherHourlyData = {
      forecast_hour_utc: "2026-01-15T02:00",
      temperature_2m_c: null,
      relative_humidity_2m_pct: null,
      dew_point_2m_c: null,
      precipitation_probability_pct: null,
      precipitation_mm: null,
      cloud_cover_pct: null,
      cloud_cover_low_pct: null,
      cloud_cover_mid_pct: null,
      cloud_cover_high_pct: null,
      visibility_m: null,
      wind_speed_10m_kmh: null,
      wind_gusts_10m_kmh: null,
      weather_code: null,
    };
    expect(() => scoreWeatherHourly(nullData)).not.toThrow();
    const result = scoreWeatherHourly(nullData);
    expect(result.score).toBe(100);
    expect(result.recommendation).toBe("unknown");
  });

  it("returns unknown when critical field cloud_cover_pct is null", () => {
    const result = scoreWeatherHourly(makeHourly({ cloud_cover_pct: null }));
    expect(result.recommendation).toBe("unknown");
  });

  it("includes positive reasons for good conditions", () => {
    const result = scoreWeatherHourly(makeHourly());
    expect(result.reasons).toEqual(
      expect.arrayContaining([expect.stringContaining("云量")])
    );
  });

  it("includes risk factors for bad conditions", () => {
    const result = scoreWeatherHourly(
      makeHourly({ wind_speed_10m_kmh: 35, relative_humidity_2m_pct: 90 })
    );
    expect(result.risks).toEqual(
      expect.arrayContaining([
        expect.stringContaining("风速"),
        expect.stringContaining("湿度"),
      ])
    );
  });

  it("combines multiple penalties correctly", () => {
    const result = scoreWeatherHourly(
      makeHourly({
        cloud_cover_pct: 50,
        cloud_cover_high_pct: 20,
        precipitation_probability_pct: 20,
        visibility_m: 5000,
        wind_speed_10m_kmh: 30,
        relative_humidity_2m_pct: 90,
      })
    );
    // total penalty = 25 + 6 + 16 + 15 + 5 + 10 = 77
    expect(result.score).toBe(23); // 100 - 77
    expect(result.recommendation).toBe("not_recommended"); // score < 40
  });
});
