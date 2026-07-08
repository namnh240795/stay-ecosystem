CREATE TABLE `bookings` (
	`id` text PRIMARY KEY NOT NULL,
	`property_id` text NOT NULL,
	`guest_id` text NOT NULL,
	`partner_id` text NOT NULL,
	`check_in` text NOT NULL,
	`check_out` text NOT NULL,
	`nights` integer NOT NULL,
	`guests` integer DEFAULT 1 NOT NULL,
	`total_price` real NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`special_requests` text,
	`cancellation_reason` text,
	`cancelled_at` text,
	`confirmed_at` text,
	`completed_at` text,
	`created_at` text DEFAULT '' NOT NULL,
	`updated_at` text DEFAULT '' NOT NULL,
	FOREIGN KEY (`property_id`) REFERENCES `properties`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`guest_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`partner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `about_content` (
	`id` text PRIMARY KEY NOT NULL,
	`data` text,
	`updated_at` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `footer_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`data` text,
	`updated_at` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `hero_slides` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text,
	`subtitle` text,
	`image_url` text,
	`link_url` text,
	`is_active` integer DEFAULT true NOT NULL,
	`sort_order` integer DEFAULT 0,
	`created_at` text DEFAULT '' NOT NULL,
	`updated_at` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `longterm_content` (
	`id` text PRIMARY KEY NOT NULL,
	`data` text,
	`updated_at` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `refund_policies` (
	`id` text PRIMARY KEY NOT NULL,
	`data` text,
	`updated_at` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `longterm_apartments` (
	`id` text PRIMARY KEY NOT NULL,
	`partner_id` text,
	`name` text NOT NULL,
	`location` text,
	`type` text,
	`area` text,
	`bedrooms` text,
	`bathrooms` text,
	`monthly_price` real,
	`description` text,
	`amenities` text,
	`available_from` text,
	`has_virtual_tour` text,
	`virtual_tour_url` text,
	`pet_friendly` text,
	`maintenance_status` text,
	`estimated_repair_cost` real,
	`maintenance_notes` text,
	`status` text DEFAULT 'available' NOT NULL,
	`created_at` text DEFAULT '' NOT NULL,
	`updated_at` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `longterm_contracts` (
	`id` text PRIMARY KEY NOT NULL,
	`apt_id` text,
	`apt_name` text,
	`location` text,
	`monthly_price` real,
	`lease_term` text,
	`tenant_name` text,
	`tenant_phone` text,
	`tenant_email` text,
	`signed_date` text,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` text DEFAULT '' NOT NULL,
	`updated_at` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `complaints` (
	`id` text PRIMARY KEY NOT NULL,
	`guest_name` text NOT NULL,
	`room_name` text NOT NULL,
	`branch_name` text NOT NULL,
	`title` text NOT NULL,
	`detail` text,
	`priority` text DEFAULT 'medium' NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`notes` text,
	`time` text,
	`created_at` text DEFAULT '' NOT NULL,
	`updated_at` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `daily_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`author` text NOT NULL,
	`role_name` text NOT NULL,
	`shift` text,
	`content` text NOT NULL,
	`issues` text,
	`date` text NOT NULL,
	`time` text,
	`created_at` text DEFAULT '' NOT NULL,
	`updated_at` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `leave_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`staff_name` text NOT NULL,
	`role_name` text,
	`branch_name` text,
	`reason` text,
	`leave_start_date` text,
	`leave_end_date` text,
	`leave_type` text,
	`original_shift_date` text,
	`original_shift_name` text,
	`target_shift_date` text,
	`target_shift_name` text,
	`target_staff_name` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`response_notes` text,
	`approved_by` text,
	`created_at` text DEFAULT '' NOT NULL,
	`updated_at` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `roles` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`permissions` text,
	`created_at` text DEFAULT '' NOT NULL,
	`updated_at` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `roles_name_unique` ON `roles` (`name`);--> statement-breakpoint
CREATE TABLE `service_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`room_name` text NOT NULL,
	`guest_name` text NOT NULL,
	`branch_name` text NOT NULL,
	`type` text NOT NULL,
	`detail` text,
	`time` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`assigned_staff` text,
	`created_at` text DEFAULT '' NOT NULL,
	`updated_at` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `staff` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`role_id` text,
	`status` text DEFAULT 'active' NOT NULL,
	`joined_at` text,
	`created_at` text DEFAULT '' NOT NULL,
	`updated_at` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` text PRIMARY KEY NOT NULL,
	`booking_id` text NOT NULL,
	`partner_id` text NOT NULL,
	`amount` real NOT NULL,
	`currency` text DEFAULT 'USD' NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`payment_method` text,
	`transaction_id` text,
	`metadata` text,
	`paid_at` text,
	`refunded_at` text,
	`created_at` text DEFAULT '' NOT NULL,
	`updated_at` text DEFAULT '' NOT NULL,
	FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`partner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `amenities` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`icon` text,
	`category` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `amenities_name_unique` ON `amenities` (`name`);--> statement-breakpoint
CREATE TABLE `availability` (
	`id` text PRIMARY KEY NOT NULL,
	`property_id` text NOT NULL,
	`date` text NOT NULL,
	`is_available` integer DEFAULT true NOT NULL,
	`price_override` real,
	`min_stay` integer DEFAULT 1,
	`created_at` text DEFAULT '' NOT NULL,
	`updated_at` text DEFAULT '' NOT NULL,
	FOREIGN KEY (`property_id`) REFERENCES `properties`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `properties` (
	`id` text PRIMARY KEY NOT NULL,
	`partner_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`address` text NOT NULL,
	`city` text NOT NULL,
	`country` text NOT NULL,
	`latitude` real,
	`longitude` real,
	`price_per_night` real NOT NULL,
	`max_guests` integer DEFAULT 2 NOT NULL,
	`bedrooms` integer DEFAULT 1 NOT NULL,
	`bathrooms` integer DEFAULT 1 NOT NULL,
	`property_type` text DEFAULT 'apartment' NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`images` text,
	`rules` text,
	`created_at` text DEFAULT '' NOT NULL,
	`updated_at` text DEFAULT '' NOT NULL,
	FOREIGN KEY (`partner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `property_amenities` (
	`property_id` text NOT NULL,
	`amenity_id` text NOT NULL,
	FOREIGN KEY (`property_id`) REFERENCES `properties`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`amenity_id`) REFERENCES `amenities`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` text PRIMARY KEY NOT NULL,
	`property_id` text NOT NULL,
	`booking_id` text NOT NULL,
	`guest_id` text NOT NULL,
	`partner_id` text NOT NULL,
	`rating` integer NOT NULL,
	`comment` text,
	`partner_reply` text,
	`partner_replied_at` text,
	`created_at` text DEFAULT '' NOT NULL,
	`updated_at` text DEFAULT '' NOT NULL,
	FOREIGN KEY (`property_id`) REFERENCES `properties`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`guest_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`partner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `group_tours` (
	`id` text PRIMARY KEY NOT NULL,
	`tour_id` text,
	`tour_name` text,
	`creator_name` text,
	`creator_email` text,
	`current_members` integer DEFAULT 0,
	`required_members` integer,
	`status` text DEFAULT 'forming' NOT NULL,
	`members` text,
	`date` text,
	`created_at` text DEFAULT '' NOT NULL,
	`updated_at` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `tour_bookings` (
	`id` text PRIMARY KEY NOT NULL,
	`tour_id` text,
	`tour_name` text,
	`image` text,
	`guest_name` text,
	`guest_phone` text,
	`guest_email` text,
	`slots` integer,
	`total_price` real,
	`booking_code` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`is_group_tour` text,
	`group_id` text,
	`date` text,
	`payment_method` text,
	`card_number_last4` text,
	`created_at` text DEFAULT '' NOT NULL,
	`updated_at` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `tours` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`region` text,
	`image` text,
	`price_per_slot` real,
	`max_slots` integer,
	`booked_slots` integer DEFAULT 0,
	`duration` text,
	`rating` real,
	`description` text,
	`highlights` text,
	`tour_type` text,
	`itinerary` text,
	`created_at` text DEFAULT '' NOT NULL,
	`updated_at` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `partner_applications` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`business_name` text NOT NULL,
	`business_type` text NOT NULL,
	`description` text,
	`documents` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`reviewed_by` text,
	`reviewed_at` text,
	`rejection_reason` text,
	`created_at` text DEFAULT '' NOT NULL,
	`updated_at` text DEFAULT '' NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`phone` text,
	`avatar_url` text,
	`role` text DEFAULT 'guest' NOT NULL,
	`auth0_sub` text NOT NULL,
	`partner_id` text,
	`created_at` text DEFAULT '' NOT NULL,
	`updated_at` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_auth0_sub_unique` ON `users` (`auth0_sub`);--> statement-breakpoint
CREATE TABLE `branches` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`brand` text,
	`location` text,
	`address` text,
	`phone` text,
	`email` text,
	`description` text,
	`image_url` text,
	`amenities` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT '' NOT NULL,
	`updated_at` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `site_config` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text,
	`updated_at` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `web_apartments` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`branch_id` text,
	`branch_name` text,
	`type` text,
	`location` text,
	`address` text,
	`description` text,
	`image_url` text,
	`images` text,
	`price_per_night` real,
	`max_guests` integer,
	`bedrooms` integer,
	`bathrooms` integer,
	`pet_friendly` text,
	`has_virtual_tour` text,
	`virtual_tour_url` text,
	`amenities` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT '' NOT NULL,
	`updated_at` text DEFAULT '' NOT NULL
);
