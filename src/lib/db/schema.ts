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

export const weather_hourly_cache = sqliteTable(
  "weather_hourly_cache",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    location_hash: text("location_hash").notNull(),
    provider: text("provider").notNull().default("open-meteo"),
    forecast_hour_utc: text("forecast_hour_utc").notNull(),
    fetched_at: text("fetched_at").notNull(),
    expires_at: text("expires_at").notNull(),
    temperature_2m_c: real("temperature_2m_c"),
    relative_humidity_2m_pct: real("relative_humidity_2m_pct"),
    dew_point_2m_c: real("dew_point_2m_c"),
    precipitation_probability_pct: real("precipitation_probability_pct"),
    precipitation_mm: real("precipitation_mm"),
    cloud_cover_pct: real("cloud_cover_pct"),
    cloud_cover_low_pct: real("cloud_cover_low_pct"),
    cloud_cover_mid_pct: real("cloud_cover_mid_pct"),
    cloud_cover_high_pct: real("cloud_cover_high_pct"),
    visibility_m: real("visibility_m"),
    wind_speed_10m_kmh: real("wind_speed_10m_kmh"),
    wind_gusts_10m_kmh: real("wind_gusts_10m_kmh"),
    weather_code: real("weather_code"),
  },
  (table) => [
    uniqueIndex("weather_hourly_cache_loc_hour_idx").on(
      table.location_hash,
      table.forecast_hour_utc,
    ),
    index("weather_hourly_cache_expires_at_idx").on(table.expires_at),
    index("weather_hourly_cache_loc_provider_idx").on(
      table.location_hash,
      table.provider,
    ),
  ],
);
