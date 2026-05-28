import { z } from "zod";

export const LocationInput = z.object({
  name: z.string().min(1, "name is required").max(100, "name must be 100 characters or fewer"),
  latitude: z.number().min(-90, "latitude must be >= -90").max(90, "latitude must be <= 90"),
  longitude: z.number().min(-180, "longitude must be >= -180").max(180, "longitude must be <= 180"),
  elevation_m: z.number().optional(),
  timezone: z.string().optional(),
  region: z.string().optional(),
  access_note: z.string().optional(),
  foreground_note: z.string().optional(),
  safety_note: z.string().optional(),
  tags: z.array(z.string().min(1, "tag must not be empty").max(30, "tag must be 30 characters or fewer").transform((s) => s.trim())).optional(),
  is_favorite: z.boolean().optional(),
  personal_rating: z.number().int().min(1, "rating must be >= 1").max(5, "rating must be <= 5").optional(),
});

export type LocationInputType = z.infer<typeof LocationInput>;

export const LocationUpdate = LocationInput.partial();

export type LocationUpdateType = z.infer<typeof LocationUpdate>;

export const ImageInput = z.object({
  caption: z.string().optional(),
  azimuth_deg: z.number().min(0, "azimuth must be >= 0").max(360, "azimuth must be <= 360").optional(),
  taken_at: z.string().datetime({ message: "taken_at must be an ISO 8601 datetime string" }).optional(),
  is_cover: z.boolean().optional(),
});

export type ImageInputType = z.infer<typeof ImageInput>;

export const TagInput = z.object({
  tag: z.string().min(1, "tag is required").max(30, "tag must be 30 characters or fewer").transform((s) => s.trim()),
});

export type TagInputType = z.infer<typeof TagInput>;
