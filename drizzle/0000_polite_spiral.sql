CREATE TABLE `location_tags` (
	`id` text PRIMARY KEY NOT NULL,
	`location_id` text NOT NULL,
	`tag` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`location_id`) REFERENCES `locations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `location_tags_location_tag_idx` ON `location_tags` (`location_id`,`tag`);--> statement-breakpoint
CREATE TABLE `locations` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`latitude` real NOT NULL,
	`longitude` real NOT NULL,
	`elevation_m` real,
	`timezone` text,
	`region` text,
	`access_note` text,
	`foreground_note` text,
	`safety_note` text,
	`is_favorite` integer DEFAULT false NOT NULL,
	`personal_rating` integer,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text
);
--> statement-breakpoint
CREATE INDEX `locations_lat_lng_idx` ON `locations` (`latitude`,`longitude`);--> statement-breakpoint
CREATE INDEX `locations_fav_updated_idx` ON `locations` (`is_favorite`,`updated_at`);--> statement-breakpoint
CREATE INDEX `locations_deleted_at_idx` ON `locations` (`deleted_at`);--> statement-breakpoint
CREATE TABLE `spot_images` (
	`id` text PRIMARY KEY NOT NULL,
	`location_id` text NOT NULL,
	`storage_key` text NOT NULL,
	`thumbnail_key` text,
	`caption` text,
	`azimuth_deg` real,
	`taken_at` text,
	`is_cover` integer DEFAULT false NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`location_id`) REFERENCES `locations`(`id`) ON UPDATE no action ON DELETE cascade
);
