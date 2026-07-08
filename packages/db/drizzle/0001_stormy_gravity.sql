CREATE TABLE `longterm_amenities` (
	`id` text PRIMARY KEY NOT NULL,
	`apartment_id` text NOT NULL,
	`amenity_name` text NOT NULL,
	FOREIGN KEY (`apartment_id`) REFERENCES `longterm_apartments`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `maintenance_records` (
	`id` text PRIMARY KEY NOT NULL,
	`apartment_id` text NOT NULL,
	`status` text DEFAULT 'clean' NOT NULL,
	`estimated_cost` real,
	`notes` text,
	`created_at` text DEFAULT '' NOT NULL,
	`updated_at` text DEFAULT '' NOT NULL,
	FOREIGN KEY (`apartment_id`) REFERENCES `longterm_apartments`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `property_images` (
	`id` text PRIMARY KEY NOT NULL,
	`property_id` text NOT NULL,
	`image_url` text NOT NULL,
	`sort_order` integer DEFAULT 0,
	FOREIGN KEY (`property_id`) REFERENCES `properties`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `tour_highlights` (
	`id` text PRIMARY KEY NOT NULL,
	`tour_id` text NOT NULL,
	`highlight_text` text NOT NULL,
	`sort_order` integer DEFAULT 0,
	FOREIGN KEY (`tour_id`) REFERENCES `tours`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `tour_itinerary` (
	`id` text PRIMARY KEY NOT NULL,
	`tour_id` text NOT NULL,
	`day_number` integer NOT NULL,
	`title` text,
	`activities` text,
	FOREIGN KEY (`tour_id`) REFERENCES `tours`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `branch_amenities` (
	`id` text PRIMARY KEY NOT NULL,
	`branch_id` text NOT NULL,
	`amenity_name` text NOT NULL,
	FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `web_apartment_amenities` (
	`id` text PRIMARY KEY NOT NULL,
	`apartment_id` text NOT NULL,
	`amenity_name` text NOT NULL,
	FOREIGN KEY (`apartment_id`) REFERENCES `web_apartments`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `web_apartment_images` (
	`id` text PRIMARY KEY NOT NULL,
	`apartment_id` text NOT NULL,
	`image_url` text NOT NULL,
	`sort_order` integer DEFAULT 0,
	FOREIGN KEY (`apartment_id`) REFERENCES `web_apartments`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_longterm_contracts` (
	`id` text PRIMARY KEY NOT NULL,
	`apt_id` text NOT NULL,
	`lease_term` text,
	`tenant_name` text,
	`tenant_phone` text,
	`tenant_email` text,
	`signed_date` text,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` text DEFAULT '' NOT NULL,
	`updated_at` text DEFAULT '' NOT NULL,
	FOREIGN KEY (`apt_id`) REFERENCES `longterm_apartments`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_longterm_contracts`("id", "apt_id", "lease_term", "tenant_name", "tenant_phone", "tenant_email", "signed_date", "status", "created_at", "updated_at") SELECT "id", "apt_id", "lease_term", "tenant_name", "tenant_phone", "tenant_email", "signed_date", "status", "created_at", "updated_at" FROM `longterm_contracts`;--> statement-breakpoint
DROP TABLE `longterm_contracts`;--> statement-breakpoint
ALTER TABLE `__new_longterm_contracts` RENAME TO `longterm_contracts`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
ALTER TABLE `longterm_apartments` DROP COLUMN `amenities`;--> statement-breakpoint
ALTER TABLE `longterm_apartments` DROP COLUMN `maintenance_status`;--> statement-breakpoint
ALTER TABLE `longterm_apartments` DROP COLUMN `estimated_repair_cost`;--> statement-breakpoint
ALTER TABLE `longterm_apartments` DROP COLUMN `maintenance_notes`;--> statement-breakpoint
ALTER TABLE `daily_logs` DROP COLUMN `role_name`;--> statement-breakpoint
ALTER TABLE `leave_requests` DROP COLUMN `role_name`;--> statement-breakpoint
ALTER TABLE `properties` DROP COLUMN `images`;--> statement-breakpoint
ALTER TABLE `group_tours` DROP COLUMN `tour_name`;--> statement-breakpoint
ALTER TABLE `tour_bookings` DROP COLUMN `tour_name`;--> statement-breakpoint
ALTER TABLE `tour_bookings` DROP COLUMN `image`;--> statement-breakpoint
ALTER TABLE `tours` DROP COLUMN `booked_slots`;--> statement-breakpoint
ALTER TABLE `tours` DROP COLUMN `highlights`;--> statement-breakpoint
ALTER TABLE `tours` DROP COLUMN `itinerary`;--> statement-breakpoint
ALTER TABLE `branches` DROP COLUMN `amenities`;--> statement-breakpoint
ALTER TABLE `web_apartments` DROP COLUMN `branch_name`;--> statement-breakpoint
ALTER TABLE `web_apartments` DROP COLUMN `images`;--> statement-breakpoint
ALTER TABLE `web_apartments` DROP COLUMN `amenities`;