/**
 * One-shot migration: splits the monolithic `agpeya.json` into one `{hour}.json`
 * per hour plus a shared `common.json`, converting each hour's named slots into
 * an explicit `order`.
 *
 *   npx tsx scripts/split-agpeya.ts
 *
 * Both languages are converted in the same run on purpose. Whether a prayer is
 * shared is decided from English and Arabic together — a section is promoted to
 * `common.json` only where *both* languages repeat it at exactly the same hours —
 * so the two languages come out with identical `order` arrays and the reader can
 * align them by id. Where they disagree, the section stays proper to its hour in
 * both and the disagreement is reported at the end rather than papered over.
 *
 * Anything the old schema stored but nothing read (terce's second gospel) is
 * carried through rather than dropped; the loader decides what to serve.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import type {
	AgpeyaCommonFile,
	AgpeyaHourFile,
	AgpeyaHourId,
	AgpeyaLanguage,
	AgpeyaOrderEntry,
	AgpeyaOrderGroup,
	AgpeyaSection,
	AgpeyaSectionKind,
} from '../src/agpeya/types'

type Json = Record<string, unknown>

const LANGUAGES: AgpeyaLanguage[] = ['en', 'ar']
const HOUR_IDS: AgpeyaHourId[] = [
	'prime',
	'terce',
	'sext',
	'none',
	'vespers',
	'compline',
	'midnight',
]

/** Slot → kind. Prose prayed before the psalms; the rest follow the gospel. */
const PROSE_SLOTS: [slot: string, kind: AgpeyaSectionKind][] = [
	['opening', 'opening'],
	['hourIntro', 'hour-intro'],
	['comeLetUsWorship', 'come-let-us-worship'],
	['thanksgiving', 'thanksgiving'],
	['litanies', 'litany'],
	['lordsPrayer', 'lords-prayer'],
	['thanksgivingAfter', 'thanksgiving-after'],
	['closing', 'closing'],
]
const AFTER_GOSPEL = new Set<AgpeyaSectionKind>([
	'litany',
	'lords-prayer',
	'thanksgiving-after',
	'closing',
])

const HANDLED = new Set([
	'id',
	'name',
	'englishName',
	'traditionalTime',
	'introduction',
	'psalmsIntro',
	'theme',
	'psalmRefs',
	'psalms',
	'introductoryPsalm',
	'gospelRef',
	'gospelRef2',
	'watches',
	...PROSE_SLOTS.map(([slot]) => slot),
])

/** Deterministic string order, independent of locale. */
const byCodePoint = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0)

const kebab = (s: string) => s.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()

// ── slot → section ───────────────────────────────────────────────────────────

function proseSection(id: string, kind: AgpeyaSectionKind, block: Json): AgpeyaSection {
	const { title, content, inline, rubric, ...rest } = block
	if (Object.keys(rest).length) throw new Error(`${id}: unhandled prose keys ${Object.keys(rest)}`)
	return {
		id,
		kind,
		...(title ? { title: title as string } : {}),
		...(rubric ? { rubric: rubric as string } : {}),
		content: content as string[],
		...(inline ? { inline: true } : {}),
	} as AgpeyaSection
}

function psalmSection(
	id: string,
	kind: 'psalm' | 'intro-psalm',
	ref: Json,
	embedded?: Json,
): AgpeyaSection {
	const { psalmNumber, title, startVerse, endVerse, rubric, note, ...rest } = ref
	if (Object.keys(rest).length) throw new Error(`${id}: unhandled psalm keys ${Object.keys(rest)}`)
	return {
		id,
		kind,
		psalmNumber: psalmNumber as number,
		...(title ? { title: title as string } : {}),
		...(rubric ? { rubric: rubric as string } : {}),
		...(startVerse != null ? { startVerse: startVerse as number } : {}),
		...(endVerse != null ? { endVerse: endVerse as number } : {}),
		...(note ? { note: note as string } : {}),
		...(embedded?.verses ? { verses: embedded.verses } : {}),
	} as AgpeyaSection
}

function gospelSection(id: string, ref: Json): AgpeyaSection {
	const { book, chapter, startVerse, endVerse, rubric, ...rest } = ref
	if (Object.keys(rest).length) throw new Error(`${id}: unhandled gospel keys ${Object.keys(rest)}`)
	return {
		id,
		kind: 'gospel',
		book: book as string,
		chapter: chapter as number,
		startVerse: startVerse as number,
		endVerse: endVerse as number,
		...(rubric ? { rubric: rubric as string } : {}),
	}
}

/**
 * Every section of a unit (an hour, or one midnight watch) in prayed sequence.
 * `psalmRefs[i]` and `psalms[i]` were positionally paired in the old schema;
 * collapsing them into one section per psalm is what retires that coupling, so
 * a length mismatch is a hard error rather than a silently truncated hour.
 */
function unitSections(unit: Json, prefix: string): AgpeyaSection[] {
	const unknown = Object.keys(unit).filter((k) => !HANDLED.has(k))
	if (unknown.length) throw new Error(`${prefix}: unhandled slots ${unknown}`)

	const before: AgpeyaSection[] = []
	const after: AgpeyaSection[] = []
	for (const [slot, kind] of PROSE_SLOTS) {
		const block = unit[slot] as Json | undefined
		if (!block) continue
		;(AFTER_GOSPEL.has(kind) ? after : before).push(proseSection(`${prefix}-${kind}`, kind, block))
	}

	const refs = (unit.psalmRefs ?? []) as Json[]
	const embedded = (unit.psalms ?? []) as Json[]
	if (embedded.length && embedded.length !== refs.length)
		throw new Error(`${prefix}: ${refs.length} psalmRefs but ${embedded.length} embedded psalms`)

	const intro = unit.introductoryPsalm as Json | undefined
	return [
		...before,
		...(intro ? [psalmSection(`${prefix}-intro-psalm`, 'intro-psalm', intro, intro)] : []),
		...refs.map((ref, i) =>
			psalmSection(`${prefix}-psalm-${ref.psalmNumber}`, 'psalm', ref, embedded[i]),
		),
		...[unit.gospelRef, unit.gospelRef2]
			.filter(Boolean)
			.map((ref, i) => gospelSection(`${prefix}-gospel${i ? `-${i + 1}` : ''}`, ref as Json)),
		...after,
	]
}

// ── build one language's hours ───────────────────────────────────────────────

interface Built {
	hour: AgpeyaHourFile
	sections: Map<string, AgpeyaSection>
}

function buildHour(language: AgpeyaLanguage, hourId: AgpeyaHourId, unit: Json): Built {
	const sections = new Map<string, AgpeyaSection>()
	const order: AgpeyaOrderEntry[] = []
	const push = (section: AgpeyaSection) => {
		sections.set(section.id, section)
		return section.id
	}

	if (hourId === 'midnight') {
		const { watches, ...frameUnit } = unit
		// The hour's own frame brackets the watches: opening and thanksgiving
		// before, closing after.
		const frame = unitSections(frameUnit, 'midnight')
		for (const section of frame.filter((s) => s.kind !== 'closing')) order.push(push(section))
		for (const watch of watches as Json[]) {
			const { id, name, theme, psalmsIntro, ...body } = watch as Json & { id: string }
			order.push({
				group: id,
				name: name as string,
				...(theme ? { theme: theme as string } : {}),
				...(psalmsIntro ? { psalmsIntro: psalmsIntro as string } : {}),
				order: unitSections(body, id).map(push),
			} satisfies AgpeyaOrderGroup)
		}
		for (const section of frame.filter((s) => s.kind === 'closing')) order.push(push(section))
	} else {
		for (const section of unitSections(unit, hourId)) order.push(push(section))
	}

	return {
		sections,
		hour: {
			id: hourId,
			language,
			name: unit.name as string,
			englishName: unit.englishName as string,
			traditionalTime: unit.traditionalTime as string,
			...(unit.introduction ? { introduction: unit.introduction as string } : {}),
			...(unit.psalmsIntro ? { psalmsIntro: unit.psalmsIntro as string } : {}),
			order,
			sections: [],
		},
	}
}

interface Loaded {
	dir: string
	legacyCommon: Record<string, Json>
	built: Map<AgpeyaHourId, Built>
}

const loaded = new Map<AgpeyaLanguage, Loaded>()
for (const language of LANGUAGES) {
	const dir = join(import.meta.dirname, '..', 'src', language, 'agpeya')
	const read = (file: string) => JSON.parse(readFileSync(join(dir, file), 'utf8'))
	const legacy = read('agpeya.json') as { hours: Record<string, Json>; midnight: Json }
	const legacyCommon = read('common.json') as Record<string, Json>
	// The script rewrites common.json in place, so a second run would otherwise
	// read its own output back as if it were the old flat map.
	if ('sections' in legacyCommon) throw new Error(`${language}: common.json is already split`)

	// The English loader swapped in the shared thanksgiving at runtime while the
	// Arabic one served whatever the hour held, so the raw English hours carry a
	// superseded text. Apply the substitution here and the asymmetry disappears
	// with the slots that caused it.
	const shared = legacyCommon.thanksgivingPrayer
	const units: [AgpeyaHourId, Json][] = HOUR_IDS.map((id) => [
		id,
		id === 'midnight' ? legacy.midnight : legacy.hours[id],
	])
	if (language === 'en' && shared) {
		const { id: _id, ...block } = shared
		for (const [, unit] of units) unit.thanksgiving = block
	}

	loaded.set(language, {
		dir,
		legacyCommon,
		built: new Map(units.map(([id, unit]) => [id, buildHour(language, id, unit)])),
	})
}

// ── promote what every language repeats ──────────────────────────────────────

/** Everything but the id: same text, same title, same rubric, or no merge. */
const fingerprint = (section: AgpeyaSection) => JSON.stringify({ ...section, id: undefined })

/** `hour::sectionId` — structural, so it names the same slot in every language. */
type SlotKey = string

/** Per language: slot → the sorted slots sharing its text. */
const classes = new Map<AgpeyaLanguage, Map<SlotKey, SlotKey[]>>()
for (const [language, { built }] of loaded) {
	const byFingerprint = new Map<string, SlotKey[]>()
	for (const [hourId, { sections }] of built) {
		for (const section of sections.values()) {
			const key = `${hourId}::${section.id}`
			const fp = fingerprint(section)
			byFingerprint.set(fp, [...(byFingerprint.get(fp) ?? []), key])
		}
	}
	const perSlot = new Map<SlotKey, SlotKey[]>()
	for (const group of byFingerprint.values()) {
		// Code-point order, stated explicitly. The first key of the sorted class picks
		// the shared id, so the ordering is part of the generated output — locale-aware
		// collation would reorder punctuation and silently rename common.json entries.
		const sorted = [...group].sort(byCodePoint)
		for (const key of sorted) perSlot.set(key, sorted)
	}
	classes.set(language, perSlot)
}

const [first, ...others] = LANGUAGES
const sameClass = (key: SlotKey) => {
	const base = classes.get(first)?.get(key)
	if (!base || base.length < 2) return null
	const same = others.every(
		(lang) => JSON.stringify(classes.get(lang)?.get(key) ?? []) === JSON.stringify(base),
	)
	return same ? base : null
}

// A prayer the old common.json already named keeps that name, so promoted ids
// stay recognisable instead of collapsing to bare kinds.
const namedByContent = new Map<string, string>()
for (const language of [...LANGUAGES].reverse()) {
	for (const [key, prayer] of Object.entries(loaded.get(language)?.legacyCommon ?? {})) {
		const content = (prayer.content as string[] | undefined)?.join('\n')
		if (content) namedByContent.set(content, kebab(key))
	}
}

const sharedIds = new Map<string, string>() // JSON of class → shared id
const disagreements: string[] = []
const taken = new Set<string>()

for (const key of classes.get(first)?.keys() ?? []) {
	const cls = sameClass(key)
	if (!cls) {
		const base = classes.get(first)?.get(key)
		if (base && base.length > 1) disagreements.push(key)
		continue
	}
	const classKey = JSON.stringify(cls)
	if (sharedIds.has(classKey)) continue

	const [hourId, sectionId] = cls[0].split('::')
	const section = loaded
		.get(first)
		?.built.get(hourId as AgpeyaHourId)
		?.sections.get(sectionId)
	if (!section) throw new Error(`missing section for ${cls[0]}`)

	const content = 'content' in section ? section.content.join('\n') : ''
	let id =
		namedByContent.get(content) ??
		(section.kind === 'psalm' || section.kind === 'intro-psalm'
			? `psalm-${(section as { psalmNumber: number }).psalmNumber}`
			: section.kind)
	for (let n = 2; taken.has(id); n++) id = `${section.kind}-${n}`
	taken.add(id)
	sharedIds.set(classKey, id)
}

// ── emit ─────────────────────────────────────────────────────────────────────

for (const [language, { dir, legacyCommon, built }] of loaded) {
	const commonSections: Record<string, AgpeyaSection> = {}
	const rename = (hourId: AgpeyaHourId, sectionId: string) => {
		const cls = sameClass(`${hourId}::${sectionId}`)
		return cls ? (sharedIds.get(JSON.stringify(cls)) ?? sectionId) : sectionId
	}

	for (const [hourId, { hour, sections }] of built) {
		for (const [sectionId, section] of sections) {
			const shared = rename(hourId, sectionId)
			if (shared !== sectionId) commonSections[shared] = { ...section, id: shared }
		}
		hour.order = hour.order.map((entry) =>
			typeof entry === 'string'
				? rename(hourId, entry)
				: { ...entry, order: entry.order.map((id) => rename(hourId, id)) },
		)
		hour.sections = [...sections.values()].filter((s) => rename(hourId, s.id) === s.id)
		writeFileSync(join(dir, `${hourId}.json`), `${JSON.stringify(hour, null, '\t')}\n`)
	}

	// Prayers the old common.json carried that no hour references yet — a
	// translation backlog, not dead weight. Kept addressable so an `order` can
	// pick them up once the text they belong to is filled in.
	for (const [key, prayer] of Object.entries(legacyCommon)) {
		const id = kebab(key)
		if (commonSections[id]) continue
		commonSections[id] = {
			id,
			kind: 'opening',
			...(prayer.title ? { title: prayer.title as string } : {}),
			content: (prayer.content ?? []) as string[],
			...(prayer.inline ? { inline: true } : {}),
		} as AgpeyaSection
	}

	const commonFile: AgpeyaCommonFile = { language, sections: commonSections }
	writeFileSync(join(dir, 'common.json'), `${JSON.stringify(commonFile, null, '\t')}\n`)

	const propers = [...built.values()].reduce((n, b) => n + b.hour.sections.length, 0)
	console.log(
		`${language}: ${Object.keys(commonSections).length} common sections, ${propers} propers`,
	)
}

if (disagreements.length) {
	console.log(
		`\n${disagreements.length} sections repeat in one language but not the other, so they stay proper to their hour in both:`,
	)
	for (const key of disagreements.sort(byCodePoint)) console.log(`  ${key}`)
}
