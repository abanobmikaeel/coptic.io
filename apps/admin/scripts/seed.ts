/**
 * Seed the local SQLite DB from existing @coptic/data JSON files.
 * Run: pnpm db:seed
 *
 * Seeded:
 *   ✅ texts + synaxarium_entries — EN + AR commemorations
 *   ✅ bible_verses               — EN + AR + ES (read-only)
 *   ✅ feasts                     — EN celebrations
 *
 * EN + AR pairs for the same saint share a translation_group_id (matched by name similarity).
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { randomUUID } from "node:crypto";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { bibleVerses, feasts, synaxariumEntries, texts } from "../lib/db/schema";

const DATA = resolve(__dirname, "../../../packages/data/src");

const MONTH_TO_INT: Record<string, number> = {
	Tout: 1, Baba: 2, Hator: 3, Kiahk: 4, Toba: 5, Amshir: 6,
	Baramhat: 7, Baramouda: 8, Bashans: 9, Paona: 10, Epep: 11, Mesra: 12, Nasie: 13,
};

const BIBLE_BOOK_ORDER: Record<string, number> = {
	Genesis: 1, Exodus: 2, Leviticus: 3, Numbers: 4, Deuteronomy: 5,
	Joshua: 6, Judges: 7, Ruth: 8, "1 Samuel": 9, "2 Samuel": 10,
	"1 Kings": 11, "2 Kings": 12, "1 Chronicles": 13, "2 Chronicles": 14,
	Ezra: 15, Nehemiah: 16, Esther: 17, Job: 18, Psalms: 19, Proverbs: 20,
	Ecclesiastes: 21, "Song of Solomon": 22, Isaiah: 23, Jeremiah: 24,
	Lamentations: 25, Ezekiel: 26, Daniel: 27, Hosea: 28, Joel: 29,
	Amos: 30, Obadiah: 31, Jonah: 32, Micah: 33, Nahum: 34, Habakkuk: 35,
	Zephaniah: 36, Haggai: 37, Zechariah: 38, Malachi: 39, Matthew: 40,
	Mark: 41, Luke: 42, John: 43, Acts: 44, Romans: 45, "1 Corinthians": 46,
	"2 Corinthians": 47, Galatians: 48, Ephesians: 49, Philippians: 50,
	Colossians: 51, "1 Thessalonians": 52, "2 Thessalonians": 53,
	"1 Timothy": 54, "2 Timothy": 55, Titus: 56, Philemon: 57, Hebrews: 58,
	James: 59, "1 Peter": 60, "2 Peter": 61, "1 John": 62, "2 John": 63,
	"3 John": 64, Jude: 65, Revelation: 66,
};

type RawSynaxariumData = Record<string, { id: string; name: string; text?: string; url?: string }[]>;
type RawBibleData = { books: { name: string; chapters: { num: number; verses: { num: number; text: string }[] }[] }[] };
type RawCelebrations = { celebrations: { id: number; name: string; type: string; month?: string }[] };

function readJson<T>(path: string): T {
	return JSON.parse(readFileSync(path, "utf-8")) as T;
}

/** Normalise a saint name for matching across languages */
function normaliseName(name: string): string {
	return name.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 40);
}

const sqlite = new Database(process.env.DB_PATH ?? "coptic-admin.db");
sqlite.pragma("journal_mode = WAL");
const db = drizzle(sqlite);

function seedSynaxarium() {
	console.log("\nSeeding synaxarium (EN + AR) into texts + synaxarium_entries...");

	const en = readJson<RawSynaxariumData>(resolve(DATA, "en/synaxarium/canonical.json"));
	const ar = readJson<RawSynaxariumData>(resolve(DATA, "ar/synaxarium/canonical.json"));

	// Build a lookup: dateKey + normalisedName → translation_group_id
	const groupIds = new Map<string, string>();

	const textRows: (typeof texts.$inferInsert)[] = [];
	const entryRows: (typeof synaxariumEntries.$inferInsert)[] = [];

	for (const [dateKey, entries] of Object.entries(en)) {
		const spaceIdx = dateKey.indexOf(" ");
		const copticDay = parseInt(dateKey.slice(0, spaceIdx));
		const monthStr = dateKey.slice(spaceIdx + 1);
		const copticMonth = MONTH_TO_INT[monthStr] ?? 1;

		entries.forEach((entry, idx) => {
			if (!entry.text) return;
			const groupKey = `${dateKey}::${normaliseName(entry.name)}`;
			const groupId = randomUUID();
			groupIds.set(groupKey, groupId);

			const textId = randomUUID();
			textRows.push({
				id: textId,
				translation_group_id: groupId,
				title: entry.name,
				body: entry.text,
				language: "en",
				text_type: "commemoration",
				source: entry.url ?? "copticchurch-net",
				status: "canonical",
			});
			entryRows.push({
				id: randomUUID(),
				text_id: textId,
				coptic_month: copticMonth,
				coptic_day: copticDay,
				sort_order: idx,
			});
		});
	}

	// AR — reuse group IDs by matching name
	for (const [dateKey, entries] of Object.entries(ar)) {
		const spaceIdx = dateKey.indexOf(" ");
		const copticDay = parseInt(dateKey.slice(0, spaceIdx));
		const monthStr = dateKey.slice(spaceIdx + 1);
		const copticMonth = MONTH_TO_INT[monthStr] ?? 1;

		entries.forEach((entry, idx) => {
			if (!entry.text) return;
			// Try to match to EN group — fall back to new group if no match
			const groupKey = `${dateKey}::${normaliseName(entry.name)}`;
			const groupId = groupIds.get(groupKey) ?? (() => {
				const id = randomUUID();
				groupIds.set(groupKey, id);
				return id;
			})();

			const textId = randomUUID();
			textRows.push({
				id: textId,
				translation_group_id: groupId,
				title: entry.name,
				body: entry.text,
				language: "ar",
				text_type: "commemoration",
				source: entry.url ?? "copticchurch-net",
				status: "canonical",
			});
			entryRows.push({
				id: randomUUID(),
				text_id: textId,
				coptic_month: copticMonth,
				coptic_day: copticDay,
				sort_order: idx,
			});
		});
	}

	for (let i = 0; i < textRows.length; i += 500) {
		db.insert(texts).values(textRows.slice(i, i + 500)).onConflictDoNothing().run();
	}
	for (let i = 0; i < entryRows.length; i += 500) {
		db.insert(synaxariumEntries).values(entryRows.slice(i, i + 500)).onConflictDoNothing().run();
	}
	console.log(`  ✓ ${textRows.length} text rows, ${entryRows.length} synaxarium entries`);
}

function seedBible(language: "en" | "ar" | "es") {
	console.log(`\nSeeding bible_verses (${language})...`);
	const data = readJson<RawBibleData>(resolve(DATA, language, "bible/books.json"));
	let total = 0;

	for (const book of data.books) {
		const rows: (typeof bibleVerses.$inferInsert)[] = [];
		for (const chapter of book.chapters) {
			for (const verse of chapter.verses) {
				rows.push({
					id: `${language}-${book.name}-${chapter.num}-${verse.num}`.toLowerCase().replace(/\s+/g, "-"),
					book: book.name,
					book_order: BIBLE_BOOK_ORDER[book.name] ?? 999,
					chapter: chapter.num,
					verse: verse.num,
					text: verse.text,
					language,
					source: language === "en" ? "nkjv" : null,
					status: "canonical",
				});
			}
		}
		db.insert(bibleVerses).values(rows).onConflictDoNothing().run();
		total += rows.length;
	}
	console.log(`  ✓ ${total} verses`);
}

function seedFeasts() {
	console.log("\nSeeding feasts...");
	const data = readJson<RawCelebrations>(resolve(DATA, "en/celebrations.json"));

	const typeMap: Record<string, "feast" | "fast" | "memorial" | "apostle"> = {
		feast: "feast", fast: "fast", memorial: "memorial",
		apostle: "apostle", lordlyFeast: "feast",
	};

	const rows: (typeof feasts.$inferInsert)[] = data.celebrations.map((c) => ({
		id: randomUUID(),
		name_en: c.name,
		feast_type: typeMap[c.type] ?? "feast",
		coptic_month: c.month ? MONTH_TO_INT[c.month] ?? null : null,
		is_moveable: 0,
	}));

	db.insert(feasts).values(rows).onConflictDoNothing().run();
	console.log(`  ✓ ${rows.length} feasts`);
}

function main() {
	console.log("Starting seed...");
	seedSynaxarium();
	seedBible("en");
	seedBible("ar");
	seedBible("es");
	seedFeasts();
	console.log("\n✅ Seed complete.");
	console.log("⏳ Services and agpeya/readings content added via admin UI.");
}

main();
