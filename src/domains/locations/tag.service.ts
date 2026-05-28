import { db } from "@/lib/db";
import { location_tags } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function addTag(locationId: string, tag: string): Promise<void> {
  const trimmed = tag.trim();
  if (!trimmed || trimmed.length > 30) throw new Error("Tag must be 1-30 characters");
  try {
    await db.insert(location_tags).values({
      id: crypto.randomUUID(),
      location_id: locationId,
      tag: trimmed,
      created_at: new Date().toISOString(),
    });
  } catch (e: any) {
    if (e.message?.includes("UNIQUE")) return;
    throw e;
  }
}

export async function removeTag(locationId: string, tag: string): Promise<void> {
  await db.delete(location_tags).where(and(eq(location_tags.location_id, locationId), eq(location_tags.tag, tag.trim())));
}

export async function getTags(locationId: string): Promise<string[]> {
  const rows = await db.select({ tag: location_tags.tag }).from(location_tags).where(eq(location_tags.location_id, locationId));
  return rows.map(r => r.tag);
}
