/**
 * Scrape Arabic Agpeya prayers from St-Takla.org.
 *
 * Extracts Arabic prayer prose and liturgical Psalm text. Gospel readings remain
 * references that are resolved at runtime from the Bible data. Uses the English
 * agpeya template as the structural reference.
 *
 * ⚠ Reference only — do not run this against the live data directory.
 * This is a straight port of the original `scrape_arabic_agpeya.py` (kept for its
 * parsing logic), ported here only to consolidate the repo on one scripting
 * language. It has NOT been reconciled with the per-hour Agpeya split
 * (see `packages/data/src//agpeya/{prime,terce,...}.json` and
 * `packages/data/src/agpeya/types.ts`) — it still reads/writes a single monolithic
 * `agpeya.json` + `common.json`, a shape that predates that split and no longer
 * exists on disk. `packages/data/src/ar/agpeya/*.json` also carries hand review on
 * top of whatever this originally produced. Do not run this file until it's been
 * rewritten against the current per-hour schema, and even then, diff its output
 * against the existing files instead of overwriting them outright.
 *
 * Original usage (Python): `python3 scripts/scrape_arabic_agpeya.py`
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = join(import.meta.dirname, '..')
const OUT_DIR = join(ROOT, 'packages', 'data', 'src', 'ar', 'agpeya')

const EN_JSON = join(ROOT, 'packages', 'data', 'src', 'en', 'agpeya', 'agpeya.json')

// Loosely typed on purpose: these mirror an English template shape (a single
// `agpeya.json`) that predates the per-hour split and no longer exists on disk.
// biome-ignore lint/suspicious/noExplicitAny: faithful port of untyped Python dicts
type JsonRecord = Record<string, any>

// Hour pages on St-Takla
const HOURS: Record<string, string> = {
	prime: 'https://st-takla.org/Agpeya/Agbeya_01_Prime_.html',
	terce: 'https://st-takla.org/Agpeya/Agbeya_03_Terce_.html',
	sext: 'https://st-takla.org/Agpeya/Agbeya_06_Sext_.html',
	none: 'https://st-takla.org/Agpeya/Agbeya_09_None_.html',
	vespers: 'https://st-takla.org/Agpeya/Agbeya_11_Vespers_.html',
	compline: 'https://st-takla.org/Agpeya/Agbeya_12_Compline_.html',
	midnight: 'https://st-takla.org/Agpeya/Agbeya_Midnight_.html',
}

// Arabic names for each hour
const ARABIC_NAMES: Record<string, string> = {
	prime: 'باكر',
	terce: 'الساعة الثالثة',
	sext: 'الساعة السادسة',
	none: 'الساعة التاسعة',
	vespers: 'الغروب',
	compline: 'النوم',
	midnight: 'نصف الليل',
}

// Arabic titles for common prayers (from St-Takla anchor names)
const SECTION_MAP: Record<string, string> = {
	مقدمة_كل_ساعة: 'مقدمة كل ساعة',
	الصلاة_الربانية: 'الصلاة الربانية',
	صلاة_الشكر: 'صلاة الشكر',
	بدء_الصلاة: 'بدء الصلاة',
	هلم_نسجد: 'هلم نسجد',
	بدء_صلاة_باكر: 'بدء صلاة باكر',
	بدء_صلاة_الثالثة: 'بدء صلاة الثالثة',
	بدء_صلاة_السادسة: 'بدء صلاة السادسة',
	بدء_صلاة_التاسعة: 'بدء صلاة التاسعة',
	بدء_صلاة_الغروب: 'بدء صلاة الغروب',
	بدء_صلاة_النوم: 'بدء صلاة النوم',
	نصف_الليل: 'نصف الليل',
	القطع_: 'القطع',
	تسبحة_الملائكة_: 'تسبحة الملائكة',
	الثلاث_تقديسات_: 'الثلاث تقديسات',
	السلام_لك_: 'السلام لك',
	قانون_الإيمان_المقدس_الأرثوذكسي_: 'قانون الإيمان المقدس الأرثوذكسي',
	قدوس_قدوس_قدوس_: 'قدوس قدوس قدوس',
	التحليل_: 'التحليل',
	تحليل_آخر_: 'تحليل آخر',
	طلبة_تصلى_آخر_كل_ساعة_: 'طلبة تصلى آخر كل ساعة',
	المزمور_الخمسون: 'المزمور الخمسون',
}

/** Fetch and decode a St-Takla page (Windows-1256). */
async function fetchPage(url: string): Promise<string> {
	const res = await fetch(url, {
		signal: AbortSignal.timeout(30_000),
		headers: {
			'User-Agent':
				'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
			Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
			'Accept-Language': 'en-US,en;q=0.9,ar;q=0.8',
		},
	})
	if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
	const buffer = await res.arrayBuffer()
	return new TextDecoder('windows-1256').decode(buffer)
}

/**
 * Split page into sections keyed by anchor name, extracting text paragraphs.
 *
 * Psalm sections (المزمور_*) are extracted alongside prayer prose so they can be
 * embedded as Coptic liturgical Arabic psalms (different from Van Dyck Bible).
 */
function extractSections(html: string): Record<string, string[]> {
	// Find all anchor-name markers and their positions
	const anchorPattern = /<a\s+name="([^"]+)"[^>]*>/g
	const anchors: Array<[name: string, start: number]> = []
	for (const m of html.matchAll(anchorPattern)) {
		anchors.push([m[1] ?? '', m.index])
	}

	const sections: Record<string, string[]> = {}
	const elementPattern =
		/<(?:p|div|span|font|b|h\d)(?:\s[^>]*)?>([\s\S]*?)<\/(?:p|div|span|font|b|h\d)>/g

	for (let i = 0; i < anchors.length; i++) {
		const [name, start] = anchors[i] as [string, number]
		const end = i + 1 < anchors.length ? (anchors[i + 1] as [string, number])[1] : html.length
		const block = html.slice(start, end)

		// Normalize name: strip trailing underscores and parentheses
		const normalized = name.replace(/_+$/, '').replaceAll('(', '').replaceAll(')', '')

		// Skip gospel/pauline sections (Bible text resolved at runtime)
		if (normalized.startsWith('إنجيل_')) continue
		if (normalized.startsWith('البولس_')) continue

		// Extract text from <p>, <div>, <span> tags; skip empty headers
		const paragraphs: string[] = []
		for (const tag of block.matchAll(elementPattern)) {
			const text = stripHtml(tag[1] ?? '')
			if (!text) continue
			// Skip TOC/navigation text
			if (isNavText(text)) continue
			// Skip "empty" spacer headings
			if (/^\s*$/.test(text)) continue
			paragraphs.push(text)
		}

		if (paragraphs.length > 0) {
			if (!(normalized in sections)) sections[normalized] = []
			sections[normalized]?.push(...paragraphs)
		}
	}

	return sections
}

/** Remove HTML tags, entities, and extra whitespace from a string. */
function stripHtml(text: string): string {
	let out = text.replace(/<[^>]+>/g, '')
	out = out
		.replaceAll('&nbsp;', ' ')
		.replaceAll('&amp;', '&')
		.replaceAll('&lt;', '<')
		.replaceAll('&gt;', '>')
	return out.replace(/\s+/g, ' ').trim()
}

/**
 * Split Coptic liturgical Arabic psalm text into individual verses.
 *
 * The text may contain verse numbers like '2' or '10' between verses. We split on
 * obvious verse boundaries — but the Coptic liturgical translation doesn't always
 * have explicit verse numbers, so fall back to sentence splitting.
 */
function parseVerses(text: string): Array<{ num: number; text: string }> {
	// Try splitting on standalone numbers (verse markers)
	const parts = text.split(/\s+(?=\d{1,3}\s)/)
	if (parts.length > 1) {
		const verses: Array<{ num: number; text: string }> = []
		for (const raw of parts) {
			const p = raw.trim()
			if (!p) continue
			const m = p.match(/^(\d{1,3})\s+(.*)/s)
			if (m) {
				verses.push({ num: Number(m[1]), text: (m[2] ?? '').trim() })
			} else {
				verses.push({ num: verses.length + 1, text: p })
			}
		}
		if (verses.length > 0) return verses
	}

	// Fall back: split on sentence boundaries
	return text
		.split(/(?<=[.!?])\s+/)
		.map((s) => s.trim())
		.filter((s) => s.length > 0)
		.map((s, i) => ({ num: i + 1, text: s }))
}

/** Check if text looks like navigation/table-of-contents content. */
function isNavText(text: string): boolean {
	const navIndicators = [
		'فاصل',
		'موقع الكنيسة',
		'الأنبا تكلا',
		'St-Takla',
		'←',
		'→',
		'السابق',
		'التالي',
		'صفحة',
		'الرجوع',
		'للأعلى',
	]
	if (navIndicators.some((indicator) => text.includes(indicator))) return true
	// Text that's just numbers or brackets
	return /^[\d()[\].,\s-]+$/.test(text)
}

/** Combine multiple section IDs into one flat content array. */
function gatherPrayerProse(sections: Record<string, string[]>, sectionIds: string[]): string[] {
	const content: string[] = []
	for (const sid of sectionIds) {
		if (sid in sections) content.push(...(sections[sid] ?? []))
	}
	return content
}

/** Build an Arabic hour entry using English structure as template. */
function buildHour(
	englishHour: JsonRecord,
	sections: Record<string, string[]>,
	hourId: string,
): JsonRecord {
	// Start with a copy of English (for psalmRefs, gospelRef, etc.)
	const ar: JsonRecord = { ...englishHour }

	// Replace name with Arabic; keep englishName in English
	ar.name = ARABIC_NAMES[hourId] ?? englishHour.name

	// Hour-specific anchor prefix (e.g., "بدء_صلاة_باكر" for prime)
	const hourStartMap: Record<string, string> = {
		prime: 'بدء_صلاة_باكر',
		terce: 'بدء_صلاة_الثالثة',
		sext: 'بدء_صلاة_السادسة',
		none: 'بدء_صلاة_التاسعة',
		vespers: 'بدء_صلاة_الغروب',
		compline: 'بدء_صلاة_النوم',
		midnight: 'نصف_الليل',
	}

	// --- Opening ---
	// Try hour-specific opening first, fall back to generic بدء_الصلاة
	const hourStart = hourStartMap[hourId] ?? ''
	const openingKeys = ['مقدمة_كل_ساعة', hourStart, 'بدء_الصلاة', 'هلم_نسجد'].filter(Boolean)
	const openingContent = gatherPrayerProse(sections, openingKeys)
	if (openingContent.length > 0) {
		ar.opening = { inline: true, content: openingContent }
	}

	// --- Thanksgiving ---
	const thanksgivingContent = gatherPrayerProse(sections, ['صلاة_الشكر'])
	if (thanksgivingContent.length > 0) {
		ar.thanksgiving = {
			title: 'صلاة الشكر',
			inline: false,
			content: thanksgivingContent,
		}
	}

	// --- Psalms intro ---
	// This is typically not a named section on St-Takla; copy from English
	// but check if there's an Arabic version
	if (ar.psalmsIntro) {
		for (const key of Object.keys(sections)) {
			const label = SECTION_MAP[key] ?? key
			if (label.includes('مزامير') || (sections[key] ?? []).join(' ').includes('مزامير')) {
				ar.psalmsIntro = sections[key]?.[0]
				break
			}
		}
	}

	// --- Litanies ---
	const litaniesContent = gatherPrayerProse(sections, [
		'القطع',
		'تسبحة_الملائكة',
		'قدوس_قدوس_قدوس',
		'طلبة_تصلى_آخر_كل_ساعة',
	])
	if (litaniesContent.length > 0) {
		ar.litanies = { title: 'الطلبات', content: litaniesContent }
	}

	// --- Coptic liturgical Arabic psalms (from St-Takla embedded text) ---
	// Extract psalm text from the page — these use the Coptic liturgical Arabic
	// translation, not the standard Van Dyck Bible.
	// Psalm sections appear on the page in the same order as psalmRefs, so we
	// iterate in page order (not alphabetical) to match correctly.
	const psalmKeys = Object.keys(sections).filter(
		(k) => k.startsWith('المزمور_') && k !== 'المزمور_الخمسون',
	)
	if (psalmKeys.length > 0) {
		const agpeyaPsalms: JsonRecord[] = []
		const psalmRefs: JsonRecord[] = ar.psalmRefs ?? []
		psalmKeys.forEach((key, i) => {
			const versesText = sections[key]
			if (versesText && versesText.length > 0) {
				const verses = parseVerses(versesText.join(' '))
				const ref = psalmRefs[i] ?? { psalmNumber: 0, title: key }
				agpeyaPsalms.push({
					reference: `Psalm ${ref.psalmNumber ?? '?'}`,
					title: ref.title ?? key.replace('المزمور_', 'المزمور '),
					rubric: ref.rubric,
					verses,
				})
			}
		})
		if (agpeyaPsalms.length > 0) ar.psalms = agpeyaPsalms
	}

	// --- Closing ---
	const closingContent = gatherPrayerProse(sections, ['التحليل', 'تحليل_آخر'])
	if (closingContent.length > 0) {
		ar.closing = { title: 'الختام', inline: false, content: closingContent }
	}

	// --- Lord's Prayer (if present in English template) ---
	if ('lordsPrayer' in ar) {
		const lp = gatherPrayerProse(sections, ['الصلاة_الربانية'])
		if (lp.length > 0) {
			ar.lordsPrayer = { title: 'الصلاة الربانية', inline: true, content: lp }
		}
	}

	// --- introduction ---
	const introContent = gatherPrayerProse(sections, ['من_إيمان_الكنيسة'])
	if (introContent.length > 0) {
		ar.introduction = introContent.join(' ')
	}

	// Ensure embedded gospel text from English template is removed
	// (psalms are populated from St-Takla's Coptic liturgical Arabic above)
	ar.gospel = undefined

	return ar
}

/** Build resolved liturgical Psalms in the same order as the template references. */
function buildEmbeddedPsalms(
	sections: Record<string, string[]>,
	psalmKeys: string[],
	psalmRefs: JsonRecord[],
): JsonRecord[] {
	const psalms: JsonRecord[] = []
	psalmKeys.forEach((key, i) => {
		const ref = psalmRefs[i]
		if (!ref) return
		const versesText = sections[key] ?? []
		if (versesText.length === 0) return
		psalms.push({
			reference: `Psalm ${ref.psalmNumber}`,
			title: ref.title ?? key.replace('المزمور_', 'المزمور '),
			rubric: ref.rubric,
			verses: parseVerses(versesText.join(' ')),
		})
	})
	return psalms
}

/** Build the Arabic Midnight hour and its three watches from St-Takla anchors. */
function buildMidnight(
	englishMidnight: JsonRecord,
	sections: Record<string, string[]>,
): JsonRecord {
	const midnight: JsonRecord = { ...englishMidnight }
	midnight.name = ARABIC_NAMES.midnight
	midnight.introduction = (sections.الخدمة_الأولى ?? []).join(' ')

	const opening = gatherPrayerProse(sections, ['مقدمة_كل_ساعة', 'الصلاة_الربانية'])
	if (opening.length > 0) midnight.opening = { inline: true, content: opening }

	const thanksgiving = gatherPrayerProse(sections, ['صلاة_الشكر'])
	if (thanksgiving.length > 0) {
		midnight.thanksgiving = {
			title: 'صلاة الشكر',
			inline: false,
			content: thanksgiving,
		}
	}

	const watchSpecs = [
		['بدء_الصلاة_1', 'القطع', 'الخدمة الأولى', 'السهر والاستعداد'],
		['بدء_الصلاة_2', 'القطع_2', 'الخدمة الثانية', 'التوبة والدموع'],
		['بدء_الصلاة_3', 'القطع_3', 'الخدمة الثالثة', 'الدينونة والرجاء'],
	] as const

	const sectionKeys = Object.keys(sections)
	const watches: JsonRecord[] = []
	const templates: JsonRecord[] = englishMidnight.watches ?? []
	templates.forEach((template, i) => {
		const spec = watchSpecs[i]
		if (!spec) return
		const [startKey, litanyKey, name, theme] = spec
		const start = sectionKeys.indexOf(startKey)
		const end = sectionKeys.indexOf(litanyKey)
		const psalmKeys = sectionKeys.slice(start + 1, end).filter((key) => key.startsWith('المزمور_'))
		const watch: JsonRecord = { ...template }
		watch.name = name
		watch.theme = theme
		watch.psalmsIntro = sections[startKey]?.at(-1)
		watch.psalms = buildEmbeddedPsalms(sections, psalmKeys, template.psalmRefs ?? [])
		watch.litanies = { content: sections[litanyKey] ?? [] }
		// Never retain prose copied from the English structural template.
		watch.opening = undefined
		watch.closing = undefined
		watches.push(watch)
	})
	midnight.watches = watches

	const closing = gatherPrayerProse(sections, [
		'التحليل',
		'طلبة_تصلى_آخر_كل_ساعة',
		'التحليل_الكبير_لنصف_الليل',
	])
	midnight.closing = { inline: false, content: closing }

	return midnight
}

/** Build common.json from St-Takla sections. */
function buildCommon(sections: Record<string, string[]>): JsonRecord {
	const common: JsonRecord = {}

	const opening = gatherPrayerProse(sections, ['مقدمة_كل_ساعة'])
	if (opening.length > 0) {
		common.openingInvocation = {
			id: 'opening-invocation',
			title: 'بدء الصلاة',
			inline: true,
			content: opening,
		}
	}

	const lp = gatherPrayerProse(sections, ['الصلاة_الربانية'])
	if (lp.length > 0) {
		common.lordsPrayer = {
			id: 'lords-prayer',
			title: 'الصلاة الربانية',
			inline: true,
			content: lp,
		}
	}

	const thanks = gatherPrayerProse(sections, ['صلاة_الشكر'])
	if (thanks.length > 0) {
		common.thanksgivingPrayer = {
			id: 'thanksgiving-prayer',
			title: 'صلاة الشكر',
			inline: false,
			content: thanks,
		}
	}

	const trisagion = gatherPrayerProse(sections, ['الثلاث_تقديسات'])
	if (trisagion.length > 0) {
		common.holyGod = {
			id: 'holy-god',
			title: 'الثلاث تقديسات',
			inline: true,
			content: trisagion,
		}
	}

	const absolution = gatherPrayerProse(sections, ['التحليل', 'تحليل_آخر'])
	if (absolution.length > 0) {
		common.absolution = {
			id: 'absolution',
			title: 'التحليل',
			inline: false,
			content: absolution,
		}
	}

	const creed = gatherPrayerProse(sections, ['قانون_الإيمان_المقدس_الأرثوذكسي'])
	if (creed.length > 0) {
		common.creed = {
			id: 'creed',
			title: 'قانون الإيمان',
			inline: true,
			content: creed,
		}
	}

	return common
}

async function main() {
	// Load English template
	const enData: JsonRecord = JSON.parse(readFileSync(EN_JSON, 'utf-8'))

	// Scrape each hour
	const arHours: Record<string, JsonRecord> = {}
	let allCommon: JsonRecord = {}
	const sectionsByHour: Record<string, Record<string, string[]>> = {}

	for (const [hourId, url] of Object.entries(HOURS)) {
		console.log(`Scraping ${hourId} (${ARABIC_NAMES[hourId]})...`)
		let html: string
		try {
			html = await fetchPage(url)
		} catch (e) {
			console.log(`  ERROR fetching: ${e}`)
			continue
		}

		const sections = extractSections(html)
		sectionsByHour[hourId] = sections
		console.log(`  Found ${Object.keys(sections).length} sections: ${Object.keys(sections)}`)

		// Build hour entry
		const enHour = enData.hours?.[hourId]
		if (enHour) {
			arHours[hourId] = buildHour(enHour, sections, hourId)
		}

		// Collect common sections from the first hour (they're the same across hours)
		if (hourId === 'prime') {
			allCommon = buildCommon(sections)
		}
	}

	// Build output
	const output: JsonRecord = {
		common: enData.common ?? {},
		hours: arHours,
	}

	// Midnight is one source page containing three ordered watches.
	if (enData.midnight) {
		output.midnight = buildMidnight(enData.midnight, sectionsByHour.midnight ?? {})
	}

	mkdirSync(OUT_DIR, { recursive: true })

	// Write agpeya.json
	if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true })
	const outPath = join(OUT_DIR, 'agpeya.json')
	const outJson = `${JSON.stringify(output, null, 2)}\n`
	writeFileSync(outPath, outJson, 'utf-8')
	console.log(`\nWrote ${outPath} (${Buffer.byteLength(outJson, 'utf-8')} bytes)`)

	// Write common.json
	const commonPath = join(OUT_DIR, 'common.json')
	const commonJson = `${JSON.stringify(allCommon, null, 2)}\n`
	writeFileSync(commonPath, commonJson, 'utf-8')
	console.log(`Wrote ${commonPath} (${Buffer.byteLength(commonJson, 'utf-8')} bytes)`)
}

main().catch((error) => {
	console.error('Error:', error)
	process.exit(1)
})
