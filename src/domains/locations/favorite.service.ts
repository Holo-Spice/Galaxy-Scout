import { db } from "@/lib/db";
import { locations } from "@/lib/db/schema";
import { eq, isNull, and, desc } from "drizzle-orm";

export async function toggleFavorite(locationId: string): Promise<boolean> {
  const rows = await db.select().from(locations).where(
    and(eq(locations.id, locationId), isNull(locations.deleted_at))
  );
  if (rows.length === 0) throw new Error("Location not found or deleted");

  const newVal = !rows[0].is_favorite;
  await db.update(locations)
    .set({ is_favorite: newVal, updated_at: new Date().toISOString() })
    .where(eq(locations.id, locationId));
  return newVal;
}

export async function listFavorites() {
  return db.select().from(locations)
    .where(and(eq(locations.is_favorite, true), isNull(locations.deleted_at)))
    .orderBy(desc(locations.updated_at));
}
