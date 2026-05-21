CREATE TABLE `bible_verses` (
	`id` text PRIMARY KEY NOT NULL,
	`book` text NOT NULL,
	`book_order` integer NOT NULL,
	`chapter` integer NOT NULL,
	`verse` integer NOT NULL,
	`text` text NOT NULL,
	`language` text NOT NULL,
	`version` text,
	`source` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `edit_history` (
	`id` text PRIMARY KEY NOT NULL,
	`table_name` text NOT NULL,
	`record_id` text NOT NULL,
	`field` text NOT NULL,
	`old_value` text,
	`new_value` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `feasts` (
	`id` text PRIMARY KEY NOT NULL,
	`name_en` text NOT NULL,
	`name_ar` text,
	`feast_type` text NOT NULL,
	`is_moveable` integer DEFAULT 0 NOT NULL,
	`days_from_easter` integer,
	`coptic_month` integer,
	`coptic_day` integer,
	`description` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `service_items` (
	`id` text PRIMARY KEY NOT NULL,
	`service_id` text NOT NULL,
	`position` integer NOT NULL,
	`item_type` text NOT NULL,
	`text_id` text,
	`service_ref_id` text,
	`bible_book` text,
	`bible_chapter_start` integer,
	`bible_verse_start` integer,
	`bible_chapter_end` integer,
	`bible_verse_end` integer,
	`label` text,
	`notes` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`text_id`) REFERENCES `texts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`service_ref_id`) REFERENCES `services`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `services` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`service_type` text NOT NULL,
	`season` text,
	`description` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `services_slug_unique` ON `services` (`slug`);--> statement-breakpoint
CREATE TABLE `synaxarium_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`text_id` text NOT NULL,
	`coptic_month` integer NOT NULL,
	`coptic_day` integer NOT NULL,
	`saint_category` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`text_id`) REFERENCES `texts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `texts` (
	`id` text PRIMARY KEY NOT NULL,
	`translation_group_id` text NOT NULL,
	`title` text,
	`body` text NOT NULL,
	`language` text NOT NULL,
	`text_type` text NOT NULL,
	`version` text,
	`source` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`notes` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
