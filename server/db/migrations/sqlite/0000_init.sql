CREATE TABLE IF NOT EXISTS `organizations` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`phone` text,
	`email` text,
	`address` text,
	`logo_url` text,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `users` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`email` text NOT NULL,
	`password_hash` text,
	`first_name` text,
	`last_name` text,
	`phone` text,
	`avatar_url` text,
	`role` text NOT NULL DEFAULT 'tenant',
	`is_active` integer NOT NULL DEFAULT 1,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE NO ACTION ON DELETE NO ACTION
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `dormitories` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`name` text NOT NULL,
	`address` text,
	`description` text,
	`total_floors` integer,
	`total_rooms` integer,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE NO ACTION ON DELETE NO ACTION
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `room_types` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`monthly_rent` real,
	`deposit_amount` real,
	`water_rate` real,
	`electric_rate` real,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE NO ACTION ON DELETE NO ACTION
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `rooms` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`dormitory_id` text NOT NULL,
	`room_type_id` text NOT NULL,
	`room_number` text NOT NULL,
	`floor` integer,
	`status` text NOT NULL DEFAULT 'available',
	`monthly_rent` real,
	`deposit_amount` real,
	`water_meter_last` real,
	`electric_meter_last` real,
	`note` text,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE NO ACTION ON DELETE NO ACTION,
	FOREIGN KEY (`dormitory_id`) REFERENCES `dormitories`(`id`) ON UPDATE NO ACTION ON DELETE NO ACTION,
	FOREIGN KEY (`room_type_id`) REFERENCES `room_types`(`id`) ON UPDATE NO ACTION ON DELETE NO ACTION
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `rooms_org_room_idx` ON `rooms` (`organization_id`, `room_number`);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `tenants` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`user_id` text NOT NULL,
	`citizen_id` text,
	`birth_date` text,
	`emergency_contact_name` text,
	`emergency_contact_phone` text,
	`current_address` text,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE NO ACTION ON DELETE NO ACTION,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE NO ACTION ON DELETE NO ACTION
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `contracts` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`tenant_id` text NOT NULL,
	`room_id` text NOT NULL,
	`contract_number` text,
	`start_date` text,
	`end_date` text,
	`monthly_rent` real,
	`deposit_amount` real,
	`status` text NOT NULL DEFAULT 'active',
	`pdf_url` text,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE NO ACTION ON DELETE NO ACTION,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE NO ACTION ON DELETE NO ACTION,
	FOREIGN KEY (`room_id`) REFERENCES `rooms`(`id`) ON UPDATE NO ACTION ON DELETE NO ACTION
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `invoices` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`tenant_id` text NOT NULL,
	`room_id` text NOT NULL,
	`contract_id` text NOT NULL,
	`invoice_no` text,
	`billing_month` text,
	`room_rent` real,
	`water_unit` real,
	`water_price` real,
	`electric_unit` real,
	`electric_price` real,
	`other_amount` real,
	`subtotal` real,
	`total_amount` real,
	`due_date` text,
	`status` text NOT NULL DEFAULT 'draft',
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE NO ACTION ON DELETE NO ACTION,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE NO ACTION ON DELETE NO ACTION,
	FOREIGN KEY (`room_id`) REFERENCES `rooms`(`id`) ON UPDATE NO ACTION ON DELETE NO ACTION,
	FOREIGN KEY (`contract_id`) REFERENCES `contracts`(`id`) ON UPDATE NO ACTION ON DELETE NO ACTION
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `payments` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`invoice_id` text NOT NULL,
	`payment_method` text NOT NULL,
	`amount` real NOT NULL,
	`paid_at` text,
	`transaction_ref` text,
	`slip_url` text,
	`created_by` text NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE NO ACTION ON DELETE NO ACTION,
	FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON UPDATE NO ACTION ON DELETE NO ACTION,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE NO ACTION ON DELETE NO ACTION
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `meter_readings` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`room_id` text NOT NULL,
	`month` text NOT NULL,
	`water_meter_previous` real,
	`water_meter_current` real,
	`water_unit_used` real,
	`electric_meter_previous` real,
	`electric_meter_current` real,
	`electric_unit_used` real,
	`recorded_by` text NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE NO ACTION ON DELETE NO ACTION,
	FOREIGN KEY (`room_id`) REFERENCES `rooms`(`id`) ON UPDATE NO ACTION ON DELETE NO ACTION,
	FOREIGN KEY (`recorded_by`) REFERENCES `users`(`id`) ON UPDATE NO ACTION ON DELETE NO ACTION
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `maintenance_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`tenant_id` text NOT NULL,
	`room_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`status` text NOT NULL DEFAULT 'pending',
	`priority` text,
	`assigned_to` text,
	`completed_at` text,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE NO ACTION ON DELETE NO ACTION,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE NO ACTION ON DELETE NO ACTION,
	FOREIGN KEY (`room_id`) REFERENCES `rooms`(`id`) ON UPDATE NO ACTION ON DELETE NO ACTION,
	FOREIGN KEY (`assigned_to`) REFERENCES `users`(`id`) ON UPDATE NO ACTION ON DELETE NO ACTION
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `maintenance_images` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`maintenance_request_id` text NOT NULL,
	`image_url` text NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE NO ACTION ON DELETE NO ACTION,
	FOREIGN KEY (`maintenance_request_id`) REFERENCES `maintenance_requests`(`id`) ON UPDATE NO ACTION ON DELETE NO ACTION
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`user_id` text NOT NULL,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`message` text NOT NULL,
	`is_read` integer NOT NULL DEFAULT 0,
	`created_at` integer,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE NO ACTION ON DELETE NO ACTION,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE NO ACTION ON DELETE NO ACTION
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `subscriptions` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`plan_name` text NOT NULL,
	`status` text NOT NULL,
	`max_rooms` integer,
	`max_users` integer,
	`started_at` text,
	`expired_at` text,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE NO ACTION ON DELETE NO ACTION
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `audit_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`user_id` text NOT NULL,
	`action` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`old_value` text,
	`new_value` text,
	`ip_address` text,
	`created_at` integer,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE NO ACTION ON DELETE NO ACTION,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE NO ACTION ON DELETE NO ACTION
);