import { describe, it, expect } from "vitest";
import { haversineDistance, isValidCoordinate, roundCoordinate } from "./geo";

describe("haversineDistance", () => {
  it("同一地点距离为 0", () => {
    expect(haversineDistance(0, 0, 0, 0)).toBe(0);
  });

  it("赤道上经度差 1° ≈ 111.19 km", () => {
    const d = haversineDistance(0, 0, 0, 1);
    expect(d).toBeGreaterThan(111.18);
    expect(d).toBeLessThan(111.2);
  });

  it("北京到上海直线距离 ≈ 1068 km", () => {
    // 北京 39.9°N, 116.4°E → 上海 31.2°N, 121.5°E
    const d = haversineDistance(39.9, 116.4, 31.2, 121.5);
    expect(d).toBeGreaterThan(1060);
    expect(d).toBeLessThan(1080);
  });

  it("南极到北极 ≈ 20015 km", () => {
    const d = haversineDistance(-90, 0, 90, 0);
    expect(d).toBeGreaterThan(20000);
    expect(d).toBeLessThan(20030);
  });

  it("对称性：A→B 等于 B→A", () => {
    const ab = haversineDistance(10, 20, 30, 40);
    const ba = haversineDistance(30, 40, 10, 20);
    expect(ab).toBeCloseTo(ba, 10);
  });
});

describe("isValidCoordinate", () => {
  it("合法坐标", () => {
    expect(isValidCoordinate(0, 0)).toBe(true);
    expect(isValidCoordinate(39.9, 116.4)).toBe(true);
    expect(isValidCoordinate(-90, -180)).toBe(true);
    expect(isValidCoordinate(90, 180)).toBe(true);
  });

  it("纬度越界", () => {
    expect(isValidCoordinate(-91, 0)).toBe(false);
    expect(isValidCoordinate(91, 0)).toBe(false);
  });

  it("经度越界", () => {
    expect(isValidCoordinate(0, -181)).toBe(false);
    expect(isValidCoordinate(0, 181)).toBe(false);
  });

  it("NaN / Infinity 不合法", () => {
    expect(isValidCoordinate(NaN, 0)).toBe(false);
    expect(isValidCoordinate(0, Infinity)).toBe(false);
    expect(isValidCoordinate(-Infinity, 0)).toBe(false);
  });
});

describe("roundCoordinate", () => {
  it("默认 6 位小数", () => {
    expect(roundCoordinate(39.9042)).toBe(39.9042);
    expect(roundCoordinate(116.4074)).toBe(116.4074);
  });

  it("精度截断", () => {
    expect(roundCoordinate(39.90421111, 4)).toBe(39.9042);
    expect(roundCoordinate(116.40749999, 4)).toBe(116.4075);
  });

  it("精度扩展补零不影响值", () => {
    expect(roundCoordinate(40, 6)).toBe(40);
  });

  it("负数坐标", () => {
    expect(roundCoordinate(-33.8688, 2)).toBe(-33.87);
  });
});
