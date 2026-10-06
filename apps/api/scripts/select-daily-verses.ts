/**
 * First-pass importer for the daily verse feature.
 *
 * Reads the deduplicated lectionary reading sets and asks an LLM to choose one
 * "verse of the day" per set. Output is references only — never verse text — so
 * runtime translation resolution stays authoritative and scripture is not hand-copied.
 *
 * Run:  pnpm --filter @coptic/api select:daily-verses
 * Env:  LLM_BASE_URL (default https://api.deepseek.com/v1)
 *       LLM_API_KEY  (falls back to DEEPSEEK_API_KEY)
 *       LLM_MODEL    (default deepseek-chat; any OpenAI-compatible model works)
 *       LLM_BATCH_SIZE / LLM_BATCH_DELAY_MS (optional tuning)
 *
 * Second pass:  pnpm --filter @coptic/api select:daily-verses --retry
 * Re-processes only the sets recorded in featuredVerses.errors.json and merges
 * successes back into featuredVerses.json.
 *
 * Small test run:  pnpm --filter @coptic/api select:daily-verses --limit 5
 * Processes only the first N not-yet-done sets (add --retry to limit the retry set).
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

// ── env ────────────────────────────────────────────────────────────────────────

const envPath = join(import.meta.dirname, '.env')
if (existsSync(envPath)) {
	for (const line of readFileSync(envPath, 'utf-8').split('\n')) {
		const trimmed = line.trim()
		if (trimmed && !trimmed.startsWith('#')) {
			const eq = trimmed.indexOf('=')
			if (eq > 0) process.env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim()
		}
	}
}

// ── types & constants ───────────────────────────────────────────────────────────

const SLOT_ORDER = [
	'LGospel',
	'VGospel',
	'MGospel',
	'Pauline',
	'Catholic',
	'Acts',
	'Prophecies',
	'LPsalm',
	'VPsalm',
	'MPsalm',
	'EPGospel',
	'EPPsalm',
] as const

type Slot = (typeof SLOT_ORDER)[number]
type SlotMap = Partial<Record<Slot, string>>

type ReadingSet = {
	key: string
	kind: 'fixed' | 'moveable'
	label: string
	slots: SlotMap
	/** Fixed feasts/fasts/commemorations on the day, e.g. "Feast of the Cross (feast)". */
	occasion?: string
	/** Liturgical season for moveable days, e.g. "Great Lent". */
	season?: string
}

type FeaturedEntry = { slot: string; reference: string; reading: string }
type FeaturedFile = {
	fixed: Record<string, FeaturedEntry>
	moveable: Record<string, FeaturedEntry>
}
type ErrorEntry = { kind: 'fixed' | 'moveable'; key: string; label: string; reason: string }
type Result = { ok: true; entry: FeaturedEntry } | { ok: false; reason: string }

// Known typos in the source references. Applied to the in-memory representation only
// (the prompt and the output); the source JSONs are never patched by this script.
const BOOK_FIXUPS: Record<string, string> = { '2 Corinthian': '2 Corinthians' }

const RESOURCES = join(import.meta.dirname, '../src/resources')
const OUT_PATH = join(RESOURCES, 'featuredVerses.json')
const ERR_PATH = join(RESOURCES, 'featuredVerses.errors.json')

const SYSTEM_PROMPT = `You select the "verse of the day" for a Coptic Orthodox liturgical day.
Given the day's lectionary readings, choose ONE verse that best stands alone as a devotional verse:
- self-contained: meaningful without the surrounding verses
- not a connective fragment ("therefore…", "for…", "and he said…")
- theologically weighty
- well-known, beloved verses are always welcome
- when the day lists an Occasion or Season, prefer a verse that speaks to it (a feast → the feast's theme; Lent → repentance and returning to God; the Cross → the Cross). A famous verse that also fits the day is ideal.
Rules:
- Choose ONLY a verse that exists inside the references listed. Never invent a reference.
- Copy the book name EXACTLY as written ("Psalms", "2 Corinthians", "1 John").
- Prefer the Gospel; fall back to the Psalm, Pauline, Catholic, Acts, or perhaps other readings when it carries a stronger standalone verse.
- Return ONLY a JSON object: {"slot":"<slot name>","reference":"<Book Chapter:Verse>"}`

// ── reading sets ───────────────────────────────────────────────────────────────

function loadJson<T>(path: string): T | null {
	if (!existsSync(path)) return null
	return JSON.parse(readFileSync(path, 'utf-8')) as T
}

const normalizePart = (part: string): string => {
	const glued = part.trim().replace(/([A-Za-z])(\d)/, '$1 $2')
	const space = glued.lastIndexOf(' ')
	if (space === -1) return glued
	const book = glued.slice(0, space).trim()
	const rest = glued.slice(space + 1).trim()
	const fixed = BOOK_FIXUPS[book]
	return fixed ? `${fixed} ${rest}` : glued
}

/** Split a slot's reference string into parts. ";" and the malformed ":"-joiner both separate. */
const splitSlot = (value: string): string[] =>
	value
		.split(/;|:\s+/)
		.map(normalizePart)
		.filter(Boolean)

const normalizeSlot = (value: string): string => splitSlot(value).join('; ')

function extractSlots(record: Record<string, unknown>): SlotMap {
	const slots: SlotMap = {}
	for (const slot of SLOT_ORDER) {
		const value = record[slot]
		if (typeof value === 'string' && value.trim()) slots[slot] = normalizeSlot(value)
	}
	return slots
}

// ── occasions (the same data the /api/readings route serves) ─────────────────────

type CelebrationRecord = { id: number; name: string; category?: string }

/** Returns a lookup from a fixed day label ("17 Tout") to its feast/fast/commemoration text. */
function loadOccasionLookup(): (label: string) => string | null {
	const dayReadings =
		loadJson<{ month: string; daysWithCelebrations: (number | number[])[] }[]>(
			join(RESOURCES, 'dayReadings.json'),
		) ?? []
	const nonMoveable =
		loadJson<{ celebrations: CelebrationRecord[] }>(join(RESOURCES, 'nonMoveableCelebrations.json'))
			?.celebrations ?? []

	const months = dayReadings.map((m) => m.month)
	const byId = new Map(nonMoveable.map((c) => [c.id, c]))

	return (label: string): string | null => {
		const space = label.indexOf(' ')
		if (space === -1) return null
		const day = Number(label.slice(0, space))
		const month = label.slice(space + 1).trim()
		if (!Number.isInteger(day)) return null

		const monthIndex = months.indexOf(month)
		const value =
			monthIndex === -1 ? undefined : dayReadings[monthIndex]?.daysWithCelebrations[day - 1]
		if (value === undefined || value === 0) return null

		const ids = Array.isArray(value) ? value : [value]
		const names = ids
			.map((id) => byId.get(id))
			.filter((c): c is CelebrationRecord => c !== undefined)
			.map((c) => `${c.name} (${c.category ?? 'feast'})`)
		return names.length > 0 ? names.join('; ') : null
	}
}

/** Moveable sets are all Lent or Jonah's Fast; the offset tells which. */
const moveableSeason = (key: string): string => {
	const offset = Number(key)
	return Number.isInteger(offset) && offset <= -66 ? "Jonah's Fast" : 'Great Lent'
}

function buildSets(): ReadingSet[] {
	const unique = loadJson<Record<string, unknown>[]>(join(RESOURCES, 'uniqueReadings.json')) ?? []
	const lent =
		loadJson<Record<string, Record<string, unknown>>>(join(RESOURCES, 'lentReadings.json')) ?? {}
	const jonah =
		loadJson<Record<string, Record<string, unknown>>>(join(RESOURCES, 'jonahReadings.json')) ?? {}
	const occasionFor = loadOccasionLookup()

	const sets: ReadingSet[] = []

	for (const record of unique) {
		const id = record.id
		if (typeof id !== 'number') {
			console.warn(`Skipping fixed reading without numeric id: ${String(record.Day)}`)
			continue
		}
		const label = typeof record.Day === 'string' ? record.Day : `id ${id}`
		const occasion = occasionFor(label)
		sets.push({
			key: String(id),
			kind: 'fixed',
			label,
			slots: extractSlots(record),
			...(occasion ? { occasion } : {}),
		})
	}

	// jonah must win on overlapping offsets, matching moveableReadingsMap spread order.
	for (const [offset, record] of Object.entries({ ...jonah, ...lent })) {
		sets.push({
			key: offset,
			kind: 'moveable',
			label: typeof record.label === 'string' ? record.label : offset,
			slots: extractSlots(record),
			season: moveableSeason(offset),
		})
	}

	return sets
}

// ── reference parsing & containment ─────────────────────────────────────────────

type ParsedRange = {
	book: string
	chapter: number
	startVerse?: number
	endVerse?: number
	endChapter?: number
}

const SINGLE_VERSE = /^[0-9]*\s*[A-Za-z]+(?:\s+[A-Za-z]+)*\s+\d+:\d+$/

function parsePart(part: string): ParsedRange | null {
	const space = part.lastIndexOf(' ')
	if (space === -1) return null
	const book = part.slice(0, space).trim()
	const range = part.slice(space + 1).trim()
	if (!/^\d[\d:-]*$/.test(range)) return null

	const [first, second] = range.split('-')
	const a = (first ?? '').split(':')
	const chapter = Number(a[0])
	if (!Number.isInteger(chapter)) return null
	const startVerse = a[1] !== undefined ? Number(a[1]) : undefined

	if (!second) return { book, chapter, startVerse }

	const b = second.split(':')
	if (b.length > 1) {
		const endChapter = Number(b[0])
		const endVerse = Number(b[1])
		if (!Number.isInteger(endChapter) || !Number.isInteger(endVerse)) return null
		return { book, chapter, startVerse, endChapter, endVerse }
	}

	const end = Number(b[0])
	if (!Number.isInteger(end)) return null
	if (startVerse !== undefined) return { book, chapter, startVerse, endVerse: end }
	return { book, chapter, endChapter: end }
}

function contains(
	range: ParsedRange,
	verse: { book: string; chapter: number; verse: number },
): boolean {
	if (range.book !== verse.book) return false
	if (range.endChapter !== undefined) {
		if (verse.chapter < range.chapter || verse.chapter > range.endChapter) return false
		if (
			verse.chapter === range.chapter &&
			range.startVerse !== undefined &&
			verse.verse < range.startVerse
		)
			return false
		if (
			verse.chapter === range.endChapter &&
			range.endVerse !== undefined &&
			verse.verse > range.endVerse
		)
			return false
		return true
	}
	if (verse.chapter !== range.chapter) return false
	if (range.startVerse !== undefined && verse.verse < range.startVerse) return false
	if (range.endVerse !== undefined && verse.verse > range.endVerse) return false
	return true
}

// ── llm call ────────────────────────────────────────────────────────────────────

type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string }

async function callModel(messages: ChatMessage[]): Promise<string> {
	const baseUrl = process.env.LLM_BASE_URL ?? 'https://api.deepseek.com/v1'
	const apiKey = process.env.LLM_API_KEY ?? process.env.DEEPSEEK_API_KEY
	const model = process.env.LLM_MODEL ?? 'deepseek-chat'

	const headers: Record<string, string> = { 'Content-Type': 'application/json' }
	if (apiKey) headers.Authorization = `Bearer ${apiKey}`

	const response = await fetch(`${baseUrl}/chat/completions`, {
		method: 'POST',
		headers,
		body: JSON.stringify({ model, messages, temperature: 0.2 }),
	})

	if (!response.ok) {
		const body = await response.text()
		throw new Error(`LLM API error ${response.status}: ${body.slice(0, 300)}`)
	}

	const data = (await response.json()) as {
		choices?: { message?: { content?: string } }[]
	}
	const content = data.choices?.[0]?.message?.content
	if (typeof content !== 'string') throw new Error('LLM response had no message content')
	return content
}

// ── prompt & validation ─────────────────────────────────────────────────────────

function buildPrompt(set: ReadingSet): string {
	const lines = SLOT_ORDER.filter((slot) => set.slots[slot]).map(
		(slot) => `- ${slot}: ${set.slots[slot]}`,
	)
	const header = [`Day: ${set.label} (${set.kind}, key ${set.key})`]
	if (set.occasion) header.push(`Occasion: ${set.occasion}`)
	if (set.season) header.push(`Season: ${set.season}`)
	return `${header.join('\n')}\n${lines.join('\n')}`
}

function parsePick(content: string): { slot: string; reference: string } | null {
	const match = content.match(/\{[\s\S]*\}/)
	if (!match) return null
	try {
		const obj = JSON.parse(match[0]) as { slot?: unknown; reference?: unknown }
		if (typeof obj.slot === 'string' && typeof obj.reference === 'string') {
			return { slot: obj.slot, reference: obj.reference }
		}
		return null
	} catch {
		return null
	}
}

function validatePick(
	pick: { slot: string; reference: string },
	set: ReadingSet,
): { ok: true; slot: Slot; reference: string; reading: string } | { ok: false; reason: string } {
	const slot = SLOT_ORDER.find((s) => s === pick.slot)
	const slotText = slot ? set.slots[slot] : undefined
	if (!slot || !slotText)
		return { ok: false, reason: `slot "${pick.slot}" is not a non-empty slot of this day` }

	const reference = normalizePart(pick.reference)
	if (!SINGLE_VERSE.test(reference))
		return { ok: false, reason: `"${reference}" is not a single-verse reference` }

	const parsed = parsePart(reference)
	if (!parsed || parsed.startVerse === undefined)
		return { ok: false, reason: `"${reference}" could not be parsed` }

	const verse = { book: parsed.book, chapter: parsed.chapter, verse: parsed.startVerse }
	const containing = splitSlot(slotText).find((part) => {
		const range = parsePart(part)
		return range ? contains(range, verse) : false
	})
	if (!containing)
		return {
			ok: false,
			reason: `"${reference}" is not inside this day's ${slot} readings (${slotText})`,
		}

	return { ok: true, slot, reference, reading: containing }
}

// ── per-set processing ──────────────────────────────────────────────────────────

async function processSet(set: ReadingSet): Promise<Result> {
	const messages: ChatMessage[] = [
		{ role: 'system', content: SYSTEM_PROMPT },
		{ role: 'user', content: buildPrompt(set) },
	]

	let lastReason = 'unknown'
	for (let attempt = 0; attempt < 2; attempt++) {
		try {
			const content = await callModel(messages)
			const pick = parsePick(content)
			if (!pick) {
				lastReason = 'response was not JSON {"slot":…,"reference":…}'
			} else {
				const validated = validatePick(pick, set)
				if (validated.ok)
					return {
						ok: true,
						entry: {
							slot: validated.slot,
							reference: validated.reference,
							reading: validated.reading,
						},
					}
				lastReason = validated.reason
			}
		} catch (err) {
			lastReason = err instanceof Error ? err.message : String(err)
		}

		if (attempt === 0) {
			messages.push({
				role: 'user',
				content: `That was invalid (${lastReason}). Return ONLY {"slot":"…","reference":"…"} using one of the references listed above, with the book name copied exactly.`,
			})
		}
	}

	return { ok: false, reason: lastReason }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/** Reads a flag as `--name value` or `--name=value`. */
const argValue = (name: string): string | undefined => {
	const eq = process.argv.find((a) => a.startsWith(`--${name}=`))
	if (eq) return eq.slice(name.length + 3)
	const idx = process.argv.indexOf(`--${name}`)
	if (idx !== -1 && process.argv[idx + 1] && !process.argv[idx + 1].startsWith('--')) {
		return process.argv[idx + 1]
	}
	return undefined
}

// ── main ────────────────────────────────────────────────────────────────────────

async function main() {
	const retry = process.argv.includes('--retry')
	const limit = Number(argValue('limit') ?? 0)
	const sets = buildSets()

	const output = loadJson<FeaturedFile>(OUT_PATH) ?? { fixed: {}, moveable: {} }
	const existingErrors = loadJson<ErrorEntry[]>(ERR_PATH) ?? []
	const errorsById = new Map(existingErrors.map((e) => [`${e.kind}:${e.key}`, e]))

	let toProcess: ReadingSet[]
	if (retry) {
		toProcess = sets.filter((s) => errorsById.has(`${s.kind}:${s.key}`))
		console.log(`Retry mode: ${toProcess.length} failed set(s) to reprocess`)
	} else {
		const done = new Set([
			...Object.keys(output.fixed).map((k) => `fixed:${k}`),
			...Object.keys(output.moveable).map((k) => `moveable:${k}`),
		])
		toProcess = sets.filter((s) => !done.has(`${s.kind}:${s.key}`))
		console.log(`${sets.length} total sets, ${toProcess.length} to process`)
	}

	if (Number.isInteger(limit) && limit > 0) {
		toProcess = toProcess.slice(0, limit)
		console.log(`Limited to first ${limit} set(s)`)
	}

	const batchSize = Number(process.env.LLM_BATCH_SIZE ?? 5)
	const batchDelay = Number(process.env.LLM_BATCH_DELAY_MS ?? 1000)

	let done = 0
	let failed = 0
	for (let i = 0; i < toProcess.length; i += batchSize) {
		const batch = toProcess.slice(i, i + batchSize)
		const settled = await Promise.all(
			batch.map(async (set) => ({ set, result: await processSet(set) })),
		)

		for (const { set, result } of settled) {
			if (result.ok) {
				output[set.kind][set.key] = result.entry
				errorsById.delete(`${set.kind}:${set.key}`)
				done++
				console.log(`  ✓ ${set.kind}:${set.key} (${set.label}) → ${result.entry.reference}`)
			} else {
				errorsById.set(`${set.kind}:${set.key}`, {
					kind: set.kind,
					key: set.key,
					label: set.label,
					reason: result.reason,
				})
				failed++
				console.log(`  ✗ ${set.kind}:${set.key} (${set.label}) → ${result.reason}`)
			}
		}

		if (i + batchSize < toProcess.length) await sleep(batchDelay)
	}

	writeFileSync(OUT_PATH, `${JSON.stringify(output, null, '\t')}\n`)
	writeFileSync(ERR_PATH, `${JSON.stringify([...errorsById.values()], null, '\t')}\n`)

	console.log(`\n${'='.repeat(50)}`)
	console.log(`Wrote ${OUT_PATH}`)
	console.log(`Succeeded: ${done}, Failed: ${failed}`)
	if (failed > 0) console.log('Re-run failed sets with: --retry')
}

main().catch((err) => {
	console.error(err)
	process.exit(1)
})
