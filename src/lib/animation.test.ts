import { describe, it, expect } from "vitest";
import { motionSafe, fadeIn } from "./animation";

describe("motionSafe", () => {
  it("returns empty object when reducedMotion is true", () => {
    expect(motionSafe(true, fadeIn)).toEqual({});
  });

  it("returns original variants when reducedMotion is false", () => {
    expect(motionSafe(false, fadeIn)).toBe(fadeIn);
  });
});
