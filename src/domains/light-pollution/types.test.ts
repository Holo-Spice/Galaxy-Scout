import { describe, it, expect } from "vitest";
import type { ViirsSample, LightQueryResult, LightScoreResult } from "./types";
import type { LightPollutionInfo, Recommendation } from "../compare/types";
import { VIIRS_RADIANCE_THRESHOLDS, SQM_SCORE_MAP } from "./constants";

describe("light-pollution types", () => {
  it("ViirsSample accepts valid shape", () => {
    const sample: ViirsSample = { latitude: 30.0, longitude: 120.0, radiance: 1.5 };
    expect(sample.latitude).toBe(30.0);
  });

  it("LightQueryResult accepts valid shape with all fields", () => {
    const result: LightQueryResult = {
      radiance: 2.5,
      darknessClass: 2,
      sqmEstimate: 21.5,
      bortleEstimate: 3,
      source: "viirs-2024",
      sourceYear: 2024,
      confidence: "medium",
    };
    expect(result.source).toBe("viirs-2024");
  });

  it("LightQueryResult accepts null optional fields", () => {
    const result: LightQueryResult = {
      radiance: null,
      darknessClass: null,
      sqmEstimate: null,
      bortleEstimate: null,
      source: "unknown",
      sourceYear: 0,
      confidence: "unknown",
    };
    expect(result.confidence).toBe("unknown");
  });

  it("LightQueryResult is compatible with LightPollutionInfo", () => {
    const result: LightQueryResult = {
      radiance: 1.0,
      darknessClass: 1,
      sqmEstimate: 22.0,
      bortleEstimate: 2,
      source: "viirs-2024",
      sourceYear: 2024,
      confidence: "high",
    };
    const info: LightPollutionInfo = result;
    expect(info.source).toBe("viirs-2024");
    expect(info.sourceYear).toBe(2024);
    expect(info.confidence).toBe("high");
  });

  it("LightScoreResult accepts valid shape", () => {
    const result: LightScoreResult = {
      score: 85,
      label: "良好",
      reasons: ["SQM 21.5"],
      risks: ["数据可能过期"],
      recommendation: "recommended",
    };
    expect(result.score).toBe(85);
  });

  it("LightScoreResult accepts all Recommendation values", () => {
    const recommendations: Recommendation[] = ["recommended", "watch", "not_recommended", "unknown"];
    for (const rec of recommendations) {
      const result: LightScoreResult = { score: 50, label: "test", reasons: [], recommendation: rec };
      expect(result.recommendation).toBe(rec);
    }
  });
});

describe("VIIRS_RADIANCE_THRESHOLDS", () => {
  it("has 5 classes", () => {
    expect(VIIRS_RADIANCE_THRESHOLDS).toHaveLength(5);
  });

  it("classes are 1-5 in order", () => {
    const classes = VIIRS_RADIANCE_THRESHOLDS.map((t) => t.class);
    expect(classes).toEqual([1, 2, 3, 4, 5]);
  });

  it("thresholds are in ascending order", () => {
    for (let i = 1; i < VIIRS_RADIANCE_THRESHOLDS.length; i++) {
      expect(VIIRS_RADIANCE_THRESHOLDS[i].maxRadiance).toBeGreaterThan(
        VIIRS_RADIANCE_THRESHOLDS[i - 1].maxRadiance,
      );
    }
  });

  it("last threshold has Infinity maxRadiance", () => {
    expect(VIIRS_RADIANCE_THRESHOLDS[4].maxRadiance).toBe(Infinity);
  });
});

describe("SQM_SCORE_MAP", () => {
  it("has 6 tiers", () => {
    expect(SQM_SCORE_MAP).toHaveLength(6);
  });

  it("scores are in descending order", () => {
    for (let i = 1; i < SQM_SCORE_MAP.length; i++) {
      expect(SQM_SCORE_MAP[i].score).toBeLessThan(SQM_SCORE_MAP[i - 1].score);
    }
  });

  it("first tier matches docs: >= 21.75 → 100", () => {
    expect(SQM_SCORE_MAP[0]).toEqual({ minSqm: 21.75, score: 100 });
  });

  it("last tier catches everything below 19.0", () => {
    expect(SQM_SCORE_MAP[5]).toEqual({ minSqm: -Infinity, score: 10 });
  });
});
