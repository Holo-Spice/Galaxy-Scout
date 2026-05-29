import { describe, it, expect } from "vitest";
import { compareRequestSchema } from "@/lib/validation/compare";

describe("compareRequestSchema", () => {
  const validRequest = {
    locationIds: ["loc_01", "loc_02"],
    dateLocal: "2026-05-15",
    startHourLocal: 20,
    endHourLocal: 5,
    timezone: "Asia/Shanghai",
  };

  describe("valid requests", () => {
    it("should parse a minimal valid request", () => {
      const result = compareRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.locationIds).toEqual(["loc_01", "loc_02"]);
        expect(result.data.dateLocal).toBe("2026-05-15");
        expect(result.data.startHourLocal).toBe(20);
        expect(result.data.endHourLocal).toBe(5);
        expect(result.data.timezone).toBe("Asia/Shanghai");
      }
    });

    it("should parse a request with optional origin", () => {
      const withOrigin = {
        ...validRequest,
        origin: {
          latitude: 30.2741,
          longitude: 120.1551,
          name: "杭州",
        },
      };
      const result = compareRequestSchema.safeParse(withOrigin);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.origin).toEqual({
          latitude: 30.2741,
          longitude: 120.1551,
          name: "杭州",
        });
      }
    });

    it("should parse a request with optional weights", () => {
      const withWeights = {
        ...validRequest,
        weights: {
          light: 0.25,
          weather: 0.4,
          astronomy: 0.25,
          distance: 0.1,
        },
      };
      const result = compareRequestSchema.safeParse(withWeights);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.weights).toEqual({
          light: 0.25,
          weather: 0.4,
          astronomy: 0.25,
          distance: 0.1,
        });
      }
    });

    it("should accept startHourLocal 0 and endHourLocal 23", () => {
      const edgeCase = {
        ...validRequest,
        startHourLocal: 0,
        endHourLocal: 23,
      };
      const result = compareRequestSchema.safeParse(edgeCase);
      expect(result.success).toBe(true);
    });
  });

  describe("invalid requests", () => {
    it("should reject empty locationIds", () => {
      const invalid = { ...validRequest, locationIds: [] };
      const result = compareRequestSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("should reject invalid dateLocal format", () => {
      const invalid = { ...validRequest, dateLocal: "15-05-2026" };
      const result = compareRequestSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("should reject dateLocal that is not YYYY-MM-DD", () => {
      const invalid = { ...validRequest, dateLocal: "2026/05/15" };
      const result = compareRequestSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("should reject startHourLocal > 23", () => {
      const invalid = { ...validRequest, startHourLocal: 24 };
      const result = compareRequestSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("should reject endHourLocal < 0", () => {
      const invalid = { ...validRequest, endHourLocal: -1 };
      const result = compareRequestSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("should reject startHourLocal as float", () => {
      const invalid = { ...validRequest, startHourLocal: 20.5 };
      const result = compareRequestSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("should reject empty timezone", () => {
      const invalid = { ...validRequest, timezone: "" };
      const result = compareRequestSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("should reject weights with values > 1", () => {
      const invalid = {
        ...validRequest,
        weights: {
          light: 1.5,
          weather: 0.4,
          astronomy: 0.25,
          distance: 0.1,
        },
      };
      const result = compareRequestSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("should reject weights with negative values", () => {
      const invalid = {
        ...validRequest,
        weights: {
          light: -0.1,
          weather: 0.4,
          astronomy: 0.25,
          distance: 0.1,
        },
      };
      const result = compareRequestSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("should reject missing required fields", () => {
      const invalid = { locationIds: ["loc_01"] };
      const result = compareRequestSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });
});
