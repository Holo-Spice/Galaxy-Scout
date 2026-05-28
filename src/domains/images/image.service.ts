import { db } from "@/lib/db";
import { spot_images } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { ImageInputType } from "@/lib/validation";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const ALLOWED_MIMES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024;

export async function uploadImage(locationId: string, file: File): Promise<any> {
  if (!ALLOWED_MIMES.includes(file.type)) throw new Error("Invalid file type. Only JPEG, PNG, WebP allowed.");
  if (file.size > MAX_SIZE) throw new Error("File too large. Maximum 10MB.");

  const ext = file.type.split("/")[1] || "jpg";
  const key = `${crypto.randomUUID()}.${ext}`;
  const filePath = path.join(UPLOAD_DIR, key);

  await mkdir(UPLOAD_DIR, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const record = {
    id,
    location_id: locationId,
    storage_key: key,
    thumbnail_key: null,
    caption: null,
    azimuth_deg: null,
    taken_at: null,
    is_cover: false,
    status: "active" as const,
    created_at: now,
  };
  await db.insert(spot_images).values(record);
  return { ...record, url: `/uploads/${key}` };
}

export async function listImages(locationId: string) {
  return db.select().from(spot_images)
    .where(and(eq(spot_images.location_id, locationId), eq(spot_images.status, "active")));
}

export async function updateImage(imageId: string, input: ImageInputType) {
  const rows = await db.select().from(spot_images).where(eq(spot_images.id, imageId));
  if (rows.length === 0) throw new Error("Image not found");

  if (input.is_cover) {
    await db.update(spot_images)
      .set({ is_cover: false })
      .where(and(
        eq(spot_images.location_id, rows[0].location_id),
        eq(spot_images.is_cover, true)
      ));
  }

  await db.update(spot_images).set(input as any).where(eq(spot_images.id, imageId));
  const updated = await db.select().from(spot_images).where(eq(spot_images.id, imageId));
  return updated[0];
}

export async function deleteImage(imageId: string) {
  const rows = await db.select().from(spot_images).where(eq(spot_images.id, imageId));
  if (rows.length === 0) throw new Error("Image not found");
  await db.update(spot_images).set({ status: "deleted" }).where(eq(spot_images.id, imageId));
}
