import type { CompareRequest, CompareResult } from "@/domains/compare/types";

const BASE_URL = "";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  const json = await res.json();
  if (!res.ok) {
    throw new ApiError(json.error?.code || "UNKNOWN", json.error?.message || "Request failed", res.status);
  }
  return json.data;
}

export class ApiError extends Error {
  constructor(public code: string, message: string, public status: number) {
    super(message);
  }
}

export interface Location {
  id: string; name: string; latitude: number; longitude: number;
  elevation_m: number | null; timezone: string | null; region: string | null;
  access_note: string | null; foreground_note: string | null; safety_note: string | null;
  is_favorite: boolean; personal_rating: number | null;
  created_at: string; updated_at: string; deleted_at: string | null;
  // Display fields for UI compatibility (mapped from DB or defaulted)
  coordinates?: string; elevation?: string; bortle?: number | null; viirs?: number | null;
  score?: number | null; status?: string; bestHour?: string; distance?: string;
  cloudCover?: number | null; precipitation?: number | null; moonPhase?: string;
  coverImage?: string | null; tags?: string[];
}

export interface Image {
  id: string; location_id: string; storage_key: string; thumbnail_key: string | null;
  caption: string | null; azimuth_deg: number | null; taken_at: string | null;
  is_cover: boolean; status: string; created_at: string; url?: string;
}

export async function getLocations(params?: { favorite?: boolean }): Promise<Location[]> {
  const query = params?.favorite ? "?favorite=true" : "";
  return request<Location[]>(`/api/locations${query}`);
}

export async function getLocation(id: string): Promise<Location> {
  return request<Location>(`/api/locations/${id}`);
}

export async function createLocation(input: Partial<Location>): Promise<Location> {
  return request<Location>("/api/locations", { method: "POST", body: JSON.stringify(input) });
}

export async function updateLocation(id: string, input: Partial<Location>): Promise<Location> {
  return request<Location>(`/api/locations/${id}`, { method: "PATCH", body: JSON.stringify(input) });
}

export async function deleteLocation(id: string): Promise<void> {
  return request<void>(`/api/locations/${id}`, { method: "DELETE" });
}

export async function getImages(locationId: string): Promise<Image[]> {
  return request<Image[]>(`/api/locations/${locationId}/images`);
}

export async function uploadImage(locationId: string, file: File, caption?: string): Promise<Image> {
  const formData = new FormData();
  formData.append("file", file);
  if (caption) formData.append("caption", caption);
  const res = await fetch(`/api/locations/${locationId}/images`, { method: "POST", body: formData });
  const json = await res.json();
  if (!res.ok) throw new ApiError(json.error?.code || "UNKNOWN", json.error?.message || "Upload failed", res.status);
  return json.data;
}

export async function updateImage(imageId: string, input: Partial<Image>): Promise<Image> {
  return request<Image>(`/api/images/${imageId}`, { method: "PATCH", body: JSON.stringify(input) });
}

export async function deleteImage(imageId: string): Promise<void> {
  return request<void>(`/api/images/${imageId}`, { method: "DELETE" });
}

export async function getCompare(req: CompareRequest): Promise<CompareResult> {
  return request<CompareResult>("/api/compare", { method: "POST", body: JSON.stringify(req) });
}
