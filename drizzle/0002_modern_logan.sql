CREATE TABLE `astronomy_hourly_cache` (
	`id` text PRIMARY KEY NOT NULL,
	`location_hash` text NOT NULL,
	`hour_utc` text NOT NULL,
	`sun_altitude_deg` real,
	`moon_altitude_deg` real,
	`moon_illumination_pct` real,
	`moon_phase_name` text,
	`galactic_center_altitude_deg` real,
	`is_astronomical_night` integer,
	`fetched_at` text NOT NULL,
	`expires_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `astronomy_hourly_cache_loc_hour_idx` ON `astronomy_hourly_cache` (`location_hash`,`hour_utc`);--> statement-breakpoint
CREATE INDEX `astronomy_hourly_cache_expires_at_idx` ON `astronomy_hourly_cache` (`expires_at`);