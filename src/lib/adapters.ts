import type { Location } from "@/lib/api-client";

export interface DisplayLocation extends Location {
  coordinates: string;
  elevation: string;
  bortle: number | null;
  viirs: number | null;
  score: number | null;
  status: "recommended" | "watch" | "not_recommended";
  bestHour: string;
  distance: string;
  cloudCover: number | null;
  precipitation: number | null;
  moonPhase: string;
  coverImage: string | null;
}

export function mapToDisplay(loc: Location): DisplayLocation {
  const latDir = loc.latitude >= 0 ? "N" : "S";
  const lonDir = loc.longitude >= 0 ? "E" : "W";
  return {
    ...loc,
    coordinates: `${Math.abs(loc.latitude).toFixed(1)}° ${latDir}, ${Math.abs(loc.longitude).toFixed(1)}° ${lonDir}`,
    elevation: loc.elevation_m != null ? `${loc.elevation_m.toLocaleString()}m` : "--",
    bortle: null,
    viirs: null,
    score: null,
    status: "watch",
    bestHour: "--",
    distance: "--",
    cloudCover: null,
    precipitation: null,
    moonPhase: "--",
    coverImage: null,
  };
}
