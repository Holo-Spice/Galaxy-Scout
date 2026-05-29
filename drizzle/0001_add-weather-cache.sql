CREATE TABLE `weather_hourly_cache` (
	`id` text PRIMARY KEY NOT NULL,
	`location_hash` text NOT NULL,
	`provider` text DEFAULT 'open-meteo' NOT NULL,
	`forecast_hour_utc` text NOT NULL,
	`fetched_at` text NOT NULL,
	`expires_at` text NOT NULL,
	`temperature_2m_c` real,
	`relative_humidity_2m_pct` real,
	`dew_point_2m_c` real,
	`precipitation_probability_pct` real,
	`precipitation_mm` real,
	`cloud_cover_pct` real,
	`cloud_cover_low_pct` real,
	`cloud_cover_mid_pct` real,
	`cloud_cover_high_pct` real,
	`visibility_m` real,
	`wind_speed_10m_kmh` real,
	`wind_gusts_10m_kmh` real,
	`weather_code` real
);
--> statement-breakpoint
CREATE UNIQUE INDEX `weather_hourly_cache_loc_hour_idx` ON `weather_hourly_cache` (`location_hash`,`forecast_hour_utc`);--> statement-breakpoint
CREATE INDEX `weather_hourly_cache_expires_at_idx` ON `weather_hourly_cache` (`expires_at`);--> statement-breakpoint
CREATE INDEX `weather_hourly_cache_loc_provider_idx` ON `weather_hourly_cache` (`location_hash`,`provider`);