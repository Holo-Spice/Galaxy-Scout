import { sqliteTable, text, real, integer, uniqueIndex, index } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const locations = sqliteTable(
  "locations",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    latitude: real("latitude").notNull(),
    longitude: real("longitude").notNull(),
    elevation_m: real("elevation_m"),
    timezone: text("timezone"),
    region: text("region"),
    access_note: text("access_note"),
    foreground_note: text("foreground_note"),
    safety_note: text("safety_note"),
    is_favorite: integer("is_favorite", { mode: "boolean" })
      .notNull()
      .default(false),
    personal_rating: integer("personal_rating"),
    created_at: text("created_at")
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
    updated_at: text("updated_at")
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
    deleted_at: text("deleted_at"),
  },
  (table) => [
    index("locations_lat_lng_idx").on(table.latitude, table.longitude),
    index("locations_fav_updated_idx").on(table.is_favorite, table.updated_at),
    index("locations_deleted_at_idx").on(table.deleted_at),
  ],
);

export const location_tags = sqliteTable(
  "location_tags",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    location_id: text("location_id")
      .notNull()
      .references(() => locations.id, { onDelete: "cascade" }),
    tag: text("tag").notNull(),
    created_at: text("created_at")
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
  },
  (table) => [
    uniqueIndex("location_tags_location_tag_idx").on(
      table.location_id,
      table.tag,
    ),
  ],
);

export const spot_images = sqliteTable("spot_images", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  location_id: text("location_id")
    .notNull()
    .references(() => locations.id, { onDelete: "cascade" }),
  storage_key: text("storage_key").notNull(),
  thumbnail_key: text("thumbnail_key"),
  caption: text("caption"),
  azimuth_deg: real("azimuth_deg"),
  taken_at: text("taken_at"),
  is_cover: integer("is_cover", { mode: "boolean" })
    .notNull()
    .default(false),
  status: text("status", { enum: ["active", "hidden", "deleted"] })
    .notNull()
    .default("active"),
  created_at: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});
