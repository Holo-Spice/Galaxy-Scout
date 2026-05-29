import { describe, it, expect } from "vitest";
import { generateLocationHash } from "./location-hash";

describe("generateLocationHash", () => {
  it("默认 4 位小数：generateLocationHash(29.2345, 120.1234) → '29.2345,120.1234'", () => {
    expect(generateLocationHash(29.2345, 120.1234)).toBe("29.2345,120.1234");
  });

  it("自定义 5 位小数：generateLocationHash(29.23456, 120.12345, 5) → '29.23456,120.12345'", () => {
    expect(generateLocationHash(29.23456, 120.12345, 5)).toBe("29.23456,120.12345");
  });

  it("相同坐标幂等：a === b", () => {
    const a = generateLocationHash(29.2345, 120.1234);
    const b = generateLocationHash(29.2345, 120.1234);
    expect(a).toBe(b);
  });

  it("纬度越界 91 → throw", () => {
    expect(() => generateLocationHash(91, 0)).toThrow();
  });

  it("经度越界 181 → throw", () => {
    expect(() => generateLocationHash(0, 181)).toThrow();
  });

  it("负坐标合法：generateLocationHash(-33.8688, 151.2093) → '-33.8688,151.2093'", () => {
    expect(generateLocationHash(-33.8688, 151.2093)).toBe("-33.8688,151.2093");
  });

  it("decimals 越界 1 → throw", () => {
    expect(() => generateLocationHash(0, 0, 1)).toThrow();
  });

  it("decimals 越界 7 → throw", () => {
    expect(() => generateLocationHash(0, 0, 7)).toThrow();
  });

  it("边界坐标合法：generateLocationHash(-90, -180) → '-90.0000,-180.0000'", () => {
    expect(generateLocationHash(-90, -180)).toBe("-90.0000,-180.0000");
  });

  it("边界坐标合法：generateLocationHash(90, 180) → '90.0000,180.0000'", () => {
    expect(generateLocationHash(90, 180)).toBe("90.0000,180.0000");
  });
});
