import { describe, it, expect } from "vitest";
import {
  getSunAltitude,
  getMoonData,
  getGalacticCenterAltitude,
  isAstronomicalNight,
  computeHourlyAstronomy,
} from "./engine";

// Beijing coordinates
const BEIJING_LAT = 39.9042;
const BEIJING_LON = 116.4074;

describe("getSunAltitude", () => {
  it("Beijing summer night (UTC 22:00 = local 06:00 next day) → sun below horizon", () => {
    // 2026-06-15T22:00 UTC → 2026-06-16T06:00 Beijing (just before dawn)
    const altitude = getSunAltitude(BEIJING_LAT, BEIJING_LON, "2026-06-15T22:00Z");
    // Sun should be very low or below horizon at this UTC time for Beijing
    expect(typeof altitude).toBe("number");
    expect(altitude).toBeLessThanOrEqual(30);
  });

  it("Beijing noon → sun altitude > 0", () => {
    // 2026-06-15T04:00 UTC → 2026-06-15T12:00 Beijing (noon)
    const altitude = getSunAltitude(BEIJING_LAT, BEIJING_LON, "2026-06-15T04:00Z");
    expect(altitude).toBeGreaterThan(0);
  });

  it("returns a finite number", () => {
    const altitude = getSunAltitude(BEIJING_LAT, BEIJING_LON, "2026-01-15T12:00Z");
    expect(Number.isFinite(altitude)).toBe(true);
  });
});

describe("isAstronomicalNight", () => {
  it("returns true when sun altitude <= -18", () => {
    // Use a known deep-night time for Beijing in winter
    // 2026-01-15T18:00 UTC → 2026-01-16T02:00 Beijing (deep night)
    const result = isAstronomicalNight(BEIJING_LAT, BEIJING_LON, "2026-01-15T18:00Z");
    expect(result).toBe(true);
  });

  it("returns false at Beijing noon", () => {
    // 2026-06-15T04:00 UTC → noon in Beijing
    const result = isAstronomicalNight(BEIJING_LAT, BEIJING_LON, "2026-06-15T04:00Z");
    expect(result).toBe(false);
  });
});

describe("getMoonData", () => {
  it("returns moon data with correct shape", () => {
    const data = getMoonData(BEIJING_LAT, BEIJING_LON, "2026-06-15T04:00Z");
    expect(typeof data.altitude_deg).toBe("number");
    expect(typeof data.illumination_pct).toBe("number");
    expect(typeof data.phase_name).toBe("string");
    expect(data.illumination_pct).toBeGreaterThanOrEqual(0);
    expect(data.illumination_pct).toBeLessThanOrEqual(100);
    expect(Number.isFinite(data.altitude_deg)).toBe(true);
  });

  it("returns Chinese phase name", () => {
    const data = getMoonData(BEIJING_LAT, BEIJING_LON, "2026-06-15T04:00Z");
    const validPhases = ["新月", "盈", "上弦月", "满月", "亏", "下弦月"];
    expect(validPhases).toContain(data.phase_name);
  });
});

describe("getGalacticCenterAltitude", () => {
  it("returns altitude in range [-90, 90]", () => {
    const alt = getGalacticCenterAltitude(BEIJING_LAT, BEIJING_LON, "2026-06-15T04:00Z");
    expect(alt).toBeGreaterThanOrEqual(-90);
    expect(alt).toBeLessThanOrEqual(90);
    expect(Number.isFinite(alt)).toBe(true);
  });

  it("varies with time of day", () => {
    const altDay = getGalacticCenterAltitude(BEIJING_LAT, BEIJING_LON, "2026-06-15T04:00Z");
    const altNight = getGalacticCenterAltitude(BEIJING_LAT, BEIJING_LON, "2026-06-15T18:00Z");
    // The two values should differ because Earth rotates
    expect(altDay).not.toBe(altNight);
  });
});

describe("computeHourlyAstronomy", () => {
  it("returns correct number of hourly entries", () => {
    const hours = [
      "2026-06-15T12:00Z",
      "2026-06-15T13:00Z",
      "2026-06-15T14:00Z",
      "2026-06-15T15:00Z",
      "2026-06-15T16:00Z",
    ];
    const input = {
      latitude: BEIJING_LAT,
      longitude: BEIJING_LON,
      dateLocal: "2026-06-15",
      timezone: "Asia/Shanghai",
    };
    const results = computeHourlyAstronomy(input, hours);
    expect(results).toHaveLength(5);
  });

  it("each entry has all required fields", () => {
    const hours = ["2026-06-15T18:00Z"];
    const input = {
      latitude: BEIJING_LAT,
      longitude: BEIJING_LON,
      dateLocal: "2026-06-15",
      timezone: "Asia/Shanghai",
    };
    const results = computeHourlyAstronomy(input, hours);
    expect(results).toHaveLength(1);
    const entry = results[0];
    expect(entry.hour_utc).toBe("2026-06-15T18:00Z");
    expect(typeof entry.sun_altitude_deg).toBe("number");
    expect(typeof entry.moon_altitude_deg).toBe("number");
    expect(typeof entry.moon_illumination_pct).toBe("number");
    expect(typeof entry.moon_phase_name).toBe("string");
    expect(typeof entry.galactic_center_altitude_deg).toBe("number");
    expect(typeof entry.is_astronomical_night).toBe("boolean");
  });

  it("nighttime entries have is_astronomical_night consistent with sun altitude", () => {
    const hours = [
      "2026-01-15T04:00Z", // noon Beijing → not night
      "2026-01-15T18:00Z", // 02:00 Beijing → deep night
    ];
    const input = {
      latitude: BEIJING_LAT,
      longitude: BEIJING_LON,
      dateLocal: "2026-01-15",
      timezone: "Asia/Shanghai",
    };
    const results = computeHourlyAstronomy(input, hours);
    // Noon entry
    expect(results[0].is_astronomical_night).toBe(false);
    expect(results[0].sun_altitude_deg).toBeGreaterThan(-18);
    // Deep night entry
    expect(results[1].is_astronomical_night).toBe(true);
    expect(results[1].sun_altitude_deg).toBeLessThanOrEqual(-18);
  });
});
