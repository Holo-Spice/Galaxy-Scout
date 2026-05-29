export interface AstronomyHourlyData {
  hour_utc: string;
  sun_altitude_deg: number;
  moon_altitude_deg: number;
  moon_illumination_pct: number;
  moon_phase_name: string;
  galactic_center_altitude_deg: number;
  is_astronomical_night: boolean;
}

export interface AstronomyInput {
  latitude: number;
  longitude: number;
  dateLocal: string;  // YYYY-MM-DD
  timezone: string;   // IANA timezone
}
