import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const texts = sqliteTable("texts", {
	id: text("id").primaryKey(),
	translation_group_id: text("translation_group_id").notNull(),
	title: text("title"),
	body: text("body").notNull(),
	language: text("language", { enum: ["en", "ar", "cop", "es"] }).notNull(),
	text_type: text("text_type", {
		enum: ["prayer", "commemoration", "rubric", "hymn", "devotional", "response", "instruction"],
	}).notNull(),
	version: text("version"),
	source: text("source"),
	status: text("status", { enum: ["draft", "reviewed", "canonical", "archived"] }).notNull().default("draft"),
	notes: text("notes"),
	created_at: text("created_at").notNull().default(sql`(datetime('now'))`),
	updated_at: text("updated_at").notNull().default(sql`(datetime('now'))`),
});

export const services = sqliteTable("services", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	slug: text("slug").notNull().unique(),
	service_type: text("service_type", {
		enum: ["agpeya_hour", "liturgy", "praise", "vespers", "devotional", "custom"],
	}).notNull(),
	season: text("season"),
	description: text("description"),
	created_at: text("created_at").notNull().default(sql`(datetime('now'))`),
	updated_at: text("updated_at").notNull().default(sql`(datetime('now'))`),
});

export const serviceItems = sqliteTable("service_items", {
	id: text("id").primaryKey(),
	service_id: text("service_id").notNull().references(() => services.id, { onDelete: "cascade" }),
	position: integer("position").notNull(),
	item_type: text("item_type", { enum: ["text", "bible_ref", "service_ref"] }).notNull(),
	text_id: text("text_id").references(() => texts.id),
	service_ref_id: text("service_ref_id").references(() => services.id),
	bible_book: text("bible_book"),
	bible_chapter_start: integer("bible_chapter_start"),
	bible_verse_start: integer("bible_verse_start"),
	bible_chapter_end: integer("bible_chapter_end"),
	bible_verse_end: integer("bible_verse_end"),
	label: text("label"),
	notes: text("notes"),
	created_at: text("created_at").notNull().default(sql`(datetime('now'))`),
});

export const synaxariumEntries = sqliteTable("synaxarium_entries", {
	id: text("id").primaryKey(),
	text_id: text("text_id").notNull().references(() => texts.id),
	coptic_month: integer("coptic_month").notNull(), // 1–13
	coptic_day: integer("coptic_day").notNull(),
	saint_category: text("saint_category", {
		enum: ["martyr", "pope", "apostle", "monastic", "bishop", "feast", "other"],
	}),
	sort_order: integer("sort_order").notNull().default(0),
});

export const feasts = sqliteTable("feasts", {
	id: text("id").primaryKey(),
	name_en: text("name_en").notNull(),
	name_ar: text("name_ar"),
	feast_type: text("feast_type", { enum: ["feast", "fast", "memorial", "apostle"] }).notNull(),
	is_moveable: integer("is_moveable").notNull().default(0),
	days_from_easter: integer("days_from_easter"),
	coptic_month: integer("coptic_month"),
	coptic_day: integer("coptic_day"),
	description: text("description"),
	created_at: text("created_at").notNull().default(sql`(datetime('now'))`),
	updated_at: text("updated_at").notNull().default(sql`(datetime('now'))`),
});

// Read-only — seeded from packages/data, never mutated via admin
export const bibleVerses = sqliteTable("bible_verses", {
	id: text("id").primaryKey(),
	book: text("book").notNull(),
	book_order: integer("book_order").notNull(),
	chapter: integer("chapter").notNull(),
	verse: integer("verse").notNull(),
	text: text("text").notNull(),
	language: text("language", { enum: ["en", "ar", "cop", "es"] }).notNull(),
	version: text("version"),
	source: text("source"),
	status: text("status", { enum: ["draft", "reviewed", "canonical"] }).notNull().default("draft"),
	created_at: text("created_at").notNull().default(sql`(datetime('now'))`),
	updated_at: text("updated_at").notNull().default(sql`(datetime('now'))`),
});

export const editHistory = sqliteTable("edit_history", {
	id: text("id").primaryKey(),
	table_name: text("table_name").notNull(),
	record_id: text("record_id").notNull(),
	field: text("field").notNull(),
	old_value: text("old_value"),
	new_value: text("new_value"),
	created_at: text("created_at").notNull().default(sql`(datetime('now'))`),
});
