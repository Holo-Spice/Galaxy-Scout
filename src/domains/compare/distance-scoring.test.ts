import { describe, it, expect } from "vitest";
import { scoreDistance } from "./distance-scoring";

describe("scoreDistance", () => {
  it("≤ 30 km → score 100, label 近", () => {
    expect(scoreDistance(0)).toEqual({ score: 100, label: "近" });
    expect(scoreDistance(15)).toEqual({ score: 100, label: "近" });
    expect(scoreDistance(30)).toEqual({ score: 100, label: "近" });
  });

  it("30-100 km → linear 100→70, label 适中", () => {
    // 65km is midpoint of 30-100 → 100 + (65-30)*(-30/70) = 100 - 15 = 85
    expect(scoreDistance(65)).toEqual({ score: 85, label: "适中" });
    expect(scoreDistance(100)).toEqual({ score: 70, label: "适中" });
  });

  it("100-250 km → linear 70→40, label 较远", () => {
    // 175km is midpoint of 100-250 → 70 + (175-100)*(-30/150) = 70 - 15 = 55
    expect(scoreDistance(175)).toEqual({ score: 55, label: "较远" });
    expect(scoreDistance(250)).toEqual({ score: 40, label: "较远" });
  });

  it("> 250 km → score 20, label 远", () => {
    expect(scoreDistance(300)).toEqual({ score: 20, label: "远" });
    expect(scoreDistance(1000)).toEqual({ score: 20, label: "远" });
  });

  it("handles negative distance as 0", () => {
    expect(scoreDistance(-5)).toEqual({ score: 100, label: "近" });
  });
});
