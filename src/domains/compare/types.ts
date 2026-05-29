export type Recommendation = "recommended" | "watch" | "not_recommended" | "unknown";

export interface CompareOrigin {
  latitude: number;
  longitude: number;
  name?: string;
}

export interface CompareWeights {
  light: number;
  weather: number;
  astronomy: number;
  distance: number;
}

export interface CompareRequest {
  locationIds: string[];
  origin?: CompareOrigin;
  dateLocal: string;
  startHourLocal: number;
  endHourLocal: number;
  timezone: string;
  weights?: CompareWeights;
}

export interface LightPollutionInfo {
  source: string;
  sourceYear: number;
  confidence: "high" | "medium" | "low" | "unknown";
}

export interface LocationSummary {
  bestHourLocal: string;
  totalScore: number;
  distanceKm: number | null;
  distanceMode: "straight_line" | "driving" | null;
  recommendation: Recommendation;
  topReasons: string[];
  risks?: string[];
}

export interface HourlyCompareData {
  hourLocal: string;
  weatherScore: number;
  lightScore: number;
  astronomyScore: number;
  distanceScore: number;
  totalScore: number;
  recommendation: Recommendation;
  topReasons: string[];
  risks?: string[];
  cloudCoverPct: number | null;
  precipitationMm: number | null;
  visibilityM: number | null;
  windSpeed10mKmh: number | null;
  temperature2mC: number | null;
  /** 月相中文名称（新月、盈、上弦月、满月、亏、下弦月），由 composer 天文模块填充 */
  moonPhaseName?: string;
}

export interface LocationCompareItem {
  locationId: string;
  locationName?: string;
  summary: LocationSummary;
  lightPollution: LightPollutionInfo | null;
  hourly: HourlyCompareData[];
}

export interface CompareMeta {
  generatedAt: string;
  weatherSource: string;
  staleLocationIds: string[];
}

export interface CompareResult {
  bestLocationId: string;
  items: LocationCompareItem[];
  meta: CompareMeta;
}
