import { describe, it, expect } from "vitest";
import {
  viirsToDarknessClass,
  viirsToSqm,
  sqmToBortle,
  estimateBortleFromViirs,
} from "./photometry";

describe("viirsToDarknessClass", () => {
  it("returns class 1 for very dark sky (radiance 0.1)", () => {
    const result = viirsToDarknessClass(0.1);
    expect(result.darknessClass).toBe(1);
    expect(result.confidence).toBe("high");
  });

  it("returns class 3 for medium sky (radiance 5.0)", () => {
    const result = viirsToDarknessClass(5.0);
    expect(result.darknessClass).toBe(3);
    expect(result.confidence).toBe("high");
  });

  it("returns null darknessClass and low confidence for null radiance", () => {
    const result = viirsToDarknessClass(null);
    expect(result.darknessClass).toBeNull();
    expect(result.confidence).toBe("low");
  });
});

describe("viirsToSqm", () => {
  it("returns SQM value in reasonable range for radiance 0.5", () => {
    const sqm = viirsToSqm(0.5);
    expect(sqm).not.toBeNull();
    expect(sqm!).toBeGreaterThanOrEqual(19);
    expect(sqm!).toBeLessThanOrEqual(23);
  });

  it("returns null for null radiance", () => {
    expect(viirsToSqm(null)).toBeNull();
  });
});

describe("sqmToBortle", () => {
  it("returns Bortle 1 or 2 for very dark SQM 21.7", () => {
    const bortle = sqmToBortle(21.7);
    expect(bortle).toBeGreaterThanOrEqual(1);
    expect(bortle).toBeLessThanOrEqual(2);
  });
});

describe("estimateBortleFromViirs", () => {
  it("returns Bortle estimate with low confidence for radiance 0.3", () => {
    const result = estimateBortleFromViirs(0.3);
    expect(result.bortle).not.toBeNull();
    expect(result.confidence).toBe("low");
  });

  it("returns null Bortle for null radiance", () => {
    const result = estimateBortleFromViirs(null);
    expect(result.bortle).toBeNull();
    expect(result.confidence).toBe("unknown");
  });
});
