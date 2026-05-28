import { db } from "@/lib/db";
import { locations, location_tags } from "@/lib/db/schema";
import { eq, isNull, and, desc } from "drizzle-orm";
import { LocationInput, LocationInputType, LocationUpdateType } from "@/lib/validation";

// Helper: get tags for a location
async function getTags(locationId: string): Promise<string[]> {
  const rows = await db.select({ tag: location_tags.tag }).from(location_tags).where(eq(location_tags.location_id, locationId));
  return rows.map(r => r.tag);
}

// Helper: attach tags to a location record
async function withTags(loc: any) {
  return { ...loc, tags: await getTags(loc.id) };
}

// Helper: attach tags to multiple location records
async function withTagsMany(locs: any[]) {
  return Promise.all(locs.map(withTags));
}

export async function createLocation(input: LocationInputType) {
  LocationInput.parse(input);
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const record = {
    id,
    name: input.name,
    latitude: input.latitude,
    longitude: input.longitude,
    elevation_m: input.elevation_m ?? null,
    timezone: input.timezone ?? null,
    region: input.region ?? null,
    access_note: input.access_note ?? null,
    foreground_note: input.foreground_note ?? null,
    safety_note: input.safety_note ?? null,
    is_favorite: input.is_favorite ?? false,
    personal_rating: input.personal_rating ?? null,
    created_at: now,
    updated_at: now,
    deleted_at: null,
  };
  await db.insert(locations).values(record);
  
  // Insert tags if provided
  if (input.tags && input.tags.length > 0) {
    for (const tag of input.tags) {
      const trimmed = tag.trim();
      if (trimmed && trimmed.length <= 30) {
        try {
          await db.insert(location_tags).values({
            id: crypto.randomUUID(),
            location_id: id,
            tag: trimmed,
            created_at: now,
          });
        } catch (e: any) {
          if (!e.message?.includes("UNIQUE")) throw e;
        }
      }
    }
  }
  
  return withTags(record);
}

export async function listLocations(opts?: { favorite?: boolean }) {
  const conditions = [isNull(locations.deleted_at)];
  if (opts?.favorite) {
    conditions.push(eq(locations.is_favorite, true));
  }
  const rows = await db.select().from(locations).where(and(...conditions)).orderBy(desc(locations.updated_at));
  return withTagsMany(rows);
}

export async function getLocationById(id: string) {
  const rows = await db.select().from(locations).where(and(eq(locations.id, id), isNull(locations.deleted_at)));
  if (rows.length === 0) return null;
  return withTags(rows[0]);
}

export async function updateLocation(id: string, input: LocationUpdateType) {
  const existing = await getLocationById(id);
  if (!existing) return null;
  const now = new Date().toISOString();
  await db.update(locations).set({ ...input, updated_at: now } as any).where(eq(locations.id, id));
  return getLocationById(id);
}

export async function deleteLocation(id: string) {
  const existing = await getLocationById(id);
  if (!existing) return null;
  const now = new Date().toISOString();
  await db.update(locations).set({ deleted_at: now, updated_at: now }).where(eq(locations.id, id));
  return { deleted: true };
}
