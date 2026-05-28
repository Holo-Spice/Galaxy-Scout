import { db } from "./index";
import { locations, location_tags, spot_images } from "./schema";
import { locations as mockLocations } from "../mock-data";
import { eq } from "drizzle-orm";

/** Run: `npx tsx src/lib/db/seed.ts` */

/** "38.6° N, 106.0° E" → { lat: 38.6, lng: 106.0 } */
function parseCoordinates(raw: string): { lat: number; lng: number } {
  const match = raw.match(
    /([\d.]+)°\s*([NS]),\s*([\d.]+)°\s*([EW])/i,
  );
  if (!match) throw new Error(`Cannot parse coordinates: "${raw}"`);
  const lat = parseFloat(match[1]) * (match[2].toUpperCase() === "S" ? -1 : 1);
  const lng = parseFloat(match[3]) * (match[4].toUpperCase() === "W" ? -1 : 1);
  return { lat, lng };
}

/** Parse "2,900m" → 2900 */
function parseElevation(raw: string): number {
  return parseFloat(raw.replace(/,/g, "").replace(/m$/i, ""));
}

function seed() {
  console.log("[seed] Starting mock data import…");

  for (const loc of mockLocations) {
    const existing = db
      .select({ id: locations.id })
      .from(locations)
      .where(eq(locations.name, loc.name))
      .get();

    if (existing) {
      console.log(`[seed] Skipping "${loc.name}" — already exists (${existing.id})`);
      continue;
    }

    const { lat, lng } = parseCoordinates(loc.coordinates);
    const elevation_m = parseElevation(loc.elevation);

    db.insert(locations)
      .values({
        id: loc.id,
        name: loc.name,
        latitude: lat,
        longitude: lng,
        elevation_m,
        is_favorite: false,
      })
      .run();

    console.log(`[seed] Inserted location: ${loc.name} (${loc.id})`);

    for (const tag of loc.tags) {
      db.insert(location_tags)
        .values({
          location_id: loc.id,
          tag,
        })
        .run();
    }
    console.log(`[seed]   → ${loc.tags.length} tags`);

    db.insert(spot_images)
      .values({
        location_id: loc.id,
        storage_key: loc.coverImage,
        is_cover: true,
        status: "active",
      })
      .run();
    console.log(`[seed]   → cover image: ${loc.coverImage}`);
  }

  const locCount = db.select().from(locations).all().length;
  const tagCount = db.select().from(location_tags).all().length;
  const imgCount = db.select().from(spot_images).all().length;
  console.log(`[seed] Done — ${locCount} locations, ${tagCount} tags, ${imgCount} images`);
}

seed();
