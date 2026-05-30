import { describe, it, expect } from "vitest";
import { scoreLightPollution } from "./scoring";
import type { LightQueryResult } from "./types";

function makeResult(overrides: Partial<LightQueryResult> = {}): LightQueryResult {
  return {
    radiance: 1.0,
    darknessClass: 2,
    sqmEstimate: 21.5,
    bortleEstimate: 3,
    source: "viirs-2024",
    sourceYear: 2024,
    confidence: "high",
    ...overrides,
  };
}

describe("scoreLightPollution", () => {
  it("SQM ≥ 21.75 → score 100, label 极佳, recommended", () => {
    const result = scoreLightPollution(makeResult({ sqmEstimate: 21.8 }));
    expect(result.score).toBe(100);
    expect(result.label).toBe("极佳");
    expect(result.recommendation).toBe("recommended");
    expect(result.reasons).toContain("天空极暗，适合天文观测");
  });

  it("SQM 20.8-21.3 → score 70, label 一般, watch", () => {
    const result = scoreLightPollution(makeResult({ sqmEstimate: 21.0 }));
    expect(result.score).toBe(70);
    expect(result.label).toBe("一般");
    expect(result.recommendation).toBe("watch");
  });

  it("SQM < 19.0 → score 10, label 极差, not_recommended", () => {
    const result = scoreLightPollution(makeResult({ sqmEstimate: 18.5 }));
    expect(result.score).toBe(10);
    expect(result.label).toBe("极差");
    expect(result.recommendation).toBe("not_recommended");
    expect(result.risks).toContain("光污染严重，不适合天文观测");
  });

  it("no SQM data, use darkness_class 1 → score 100", () => {
    const result = scoreLightPollution(
      makeResult({ sqmEstimate: null, darknessClass: 1 })
    );
    expect(result.score).toBe(100);
    expect(result.label).toBe("极佳");
    expect(result.recommendation).toBe("recommended");
  });

  it("no SQM data, use darkness_class 3 → score 70", () => {
    const result = scoreLightPollution(
      makeResult({ sqmEstimate: null, darknessClass: 3 })
    );
    expect(result.score).toBe(70);
    expect(result.label).toBe("一般");
  });

  it("no SQM data, use darkness_class 5 → score 10", () => {
    const result = scoreLightPollution(
      makeResult({ sqmEstimate: null, darknessClass: 5 })
    );
    expect(result.score).toBe(10);
    expect(result.label).toBe("极差");
    expect(result.recommendation).toBe("not_recommended");
  });

  it("no data at all → score 0, label 无数据, recommendation unknown", () => {
    const result = scoreLightPollution(
      makeResult({ sqmEstimate: null, darknessClass: null, radiance: null })
    );
    expect(result.score).toBe(0);
    expect(result.label).toBe("无数据");
    expect(result.recommendation).toBe("unknown");
    expect(result.reasons).toContain("缺少光污染数据");
  });
});
