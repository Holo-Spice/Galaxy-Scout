export interface WeatherHourlyData {
  forecast_hour_utc: string;
  temperature_2m_c: number | null;
  relative_humidity_2m_pct: number | null;
  dew_point_2m_c: number | null;
  precipitation_probability_pct: number | null;
  precipitation_mm: number | null;
  cloud_cover_pct: number | null;
  cloud_cover_low_pct: number | null;
  cloud_cover_mid_pct: number | null;
  cloud_cover_high_pct: number | null;
  visibility_m: number | null;
  wind_speed_10m_kmh: number | null;
  wind_gusts_10m_kmh: number | null;
  weather_code: number | null;
}

export interface WeatherFetchOptions {
  lat: number;
  lon: number;
  forecastDays: number;
  timezone: string;
}

export interface WeatherProviderResponse {
  hourly: {
    time: string[];
    temperature_2m: (number | null)[];
    relative_humidity_2m: (number | null)[];
    dew_point_2m: (number | null)[];
    precipitation_probability: (number | null)[];
    precipitation: (number | null)[];
    cloud_cover: (number | null)[];
    cloud_cover_low: (number | null)[];
    cloud_cover_mid: (number | null)[];
    cloud_cover_high: (number | null)[];
    visibility: (number | null)[];
    wind_speed_10m: (number | null)[];
    wind_gusts_10m: (number | null)[];
    weather_code: (number | null)[];
  };
}
