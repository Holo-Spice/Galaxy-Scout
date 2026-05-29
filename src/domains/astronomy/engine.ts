import {
  Observer,
  Equator,
  Horizon,
  MoonPhase,
  Illumination,
  Body,
} from "astronomy-engine";
import type { AstronomyHourlyData, AstronomyInput } from "./types";

const PHASE_MAP: Array<[number, string]> = [
  [22.5, "新月"],
  [67.5, "盈"],
  [112.5, "上弦月"],
  [157.5, "盈"],
  [202.5, "满月"],
  [247.5, "亏"],
  [292.5, "下弦月"],
  [337.5, "亏"],
];

/** J2000 galactic center equatorial coordinates */
const GC_RA_HOURS = 17.7611;
const GC_DEC_DEG = -29.0078;

function resolveMoonPhaseName(longitude: number): string {
  for (const [boundary, name] of PHASE_MAP) {
    if (longitude < boundary) return name;
  }
  return "新月";
}

/**
 * Returns the Sun's altitude in degrees above the horizon.
 * @param latitude  WGS84 latitude in degrees
 * @param longitude WGS84 longitude in degrees
 * @param date      ISO-8601 timestamp (UTC)
 */
export function getSunAltitude(
  latitude: number,
  longitude: number,
  date: string,
): number {
  const observer = new Observer(latitude, longitude, 0);
  const time = new Date(date);
  const eq = Equator(Body.Sun, time, observer, true, false);
  const hor = Horizon(time, observer, eq.ra, eq.dec, "normal");
  return hor.altitude;
}

/**
 * Returns Moon altitude, illumination percentage, and Chinese phase name.
 */
export function getMoonData(
  latitude: number,
  longitude: number,
  date: string,
): { altitude_deg: number; illumination_pct: number; phase_name: string } {
  const observer = new Observer(latitude, longitude, 0);
  const time = new Date(date);
  const eq = Equator(Body.Moon, time, observer, true, false);
  const hor = Horizon(time, observer, eq.ra, eq.dec, "normal");
  const illum = Illumination(Body.Moon, time);
  const phaseLon = MoonPhase(time);
  return {
    altitude_deg: hor.altitude,
    illumination_pct: illum.phase_fraction * 100,
    phase_name: resolveMoonPhaseName(phaseLon),
  };
}

/**
 * Returns the Galactic Center altitude in degrees for the given observer/time.
 * Uses fixed J2000 equatorial coordinates of Sagittarius A* (RA 17h45m, Dec -29°).
 */
export function getGalacticCenterAltitude(
  latitude: number,
  longitude: number,
  date: string,
): number {
  const observer = new Observer(latitude, longitude, 0);
  const time = new Date(date);
  const hor = Horizon(time, observer, GC_RA_HOURS, GC_DEC_DEG, "normal");
  return hor.altitude;
}

/**
 * Returns true when the Sun is at or below -18° (astronomical night).
 */
export function isAstronomicalNight(
  latitude: number,
  longitude: number,
  date: string,
): boolean {
  return getSunAltitude(latitude, longitude, date) <= -18;
}

/**
 * Computes hourly astronomy data for a location and list of UTC hour strings.
 * Pure function — no database or network access.
 */
export function computeHourlyAstronomy(
  input: AstronomyInput,
  hours: string[],
): AstronomyHourlyData[] {
  const { latitude, longitude } = input;
  return hours.map((hour_utc) => {
    const sun_altitude_deg = getSunAltitude(latitude, longitude, hour_utc);
    const moon = getMoonData(latitude, longitude, hour_utc);
    const galactic_center_altitude_deg = getGalacticCenterAltitude(
      latitude,
      longitude,
      hour_utc,
    );
    return {
      hour_utc,
      sun_altitude_deg,
      moon_altitude_deg: moon.altitude_deg,
      moon_illumination_pct: moon.illumination_pct,
      moon_phase_name: moon.phase_name,
      galactic_center_altitude_deg,
      is_astronomical_night: sun_altitude_deg <= -18,
    };
  });
}
