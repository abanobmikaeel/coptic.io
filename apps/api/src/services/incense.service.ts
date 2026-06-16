import { type DayTune, type NatureSeason, getLiturgicalContext } from '@coptic/core'
import { getIncenseService as getArIncenseService } from '@coptic/data/ar/incense'
import { getIncenseService as getCopIncenseService } from '@coptic/data/cop/incense'
import {
	type IncenseCondition,
	type IncenseConditionalBlock,
	type IncenseContent,
	type IncenseDailyPsalmSection,
	type IncenseGospelSection,
	type IncensePrayerSection,
	type IncensePsalmSection,
	type IncenseSectionData,
	type IncenseSectionRole,
	type IncenseServiceType,
	getIncenseService as getEnIncenseService,
} from '@coptic/data/en/incense'
import { getByCopticDate } from '../models/readings'
import type { BibleTranslation, BibleVerse, CopticDate, Reading } from '../types'
import { getStaticCelebrationsForDay } from '../utils/calculations/getStaticCelebrations'
import { resolvePsalm } from './psalm-resolver'

// Normalize a celebration name into a stable key the JSON block conditions can match.
const toCommemorationKey = (name: string): string =>
	name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '')

export interface ResolvedPrayerSection {
	id: string
	type: 'prayer' | 'litany' | 'creed'
	role: IncenseSectionRole
	title: string
	rubric?: string
	// Not prayed by default — offered as an extra the reader can add to the service
	// (Matins litanies at Vespers, out-of-season nature litanies, …).
	optional?: boolean
	content: IncenseContent[]
}

export interface ResolvedPsalmSection {
	id: string
	type: 'psalm'
	role: IncenseSectionRole
	title: string
	rubric?: string
	reference: string
	verses: BibleVerse[]
}

export interface ResolvedGospelSection {
	id: string
	type: 'gospel'
	role: IncenseSectionRole
	title: string
	reference: string
	verses: BibleVerse[]
}

export type ResolvedIncenseSection =
	| ResolvedPrayerSection
	| ResolvedPsalmSection
	| ResolvedGospelSection

export interface ResolvedIncenseService {
	type: string
	name: string
	date: string
	copticDate: CopticDate
	sections: ResolvedIncenseSection[]
}

function flattenReadings(readings: Reading[]): { reference: string; verses: BibleVerse[] } {
	const verses: BibleVerse[] = []
	const refs: string[] = []

	for (const reading of readings) {
		const first = reading.chapters[0]
		const last = reading.chapters[reading.chapters.length - 1]

		if (first && last) {
			const firstVerse = first.verses[0]?.num
			const lastVerse = last.verses[last.verses.length - 1]?.num

			if (firstVerse != null && lastVerse != null) {
				if (reading.chapters.length === 1) {
					refs.push(`${reading.bookName} ${first.chapterNum}:${firstVerse}-${lastVerse}`)
				} else {
					refs.push(
						`${reading.bookName} ${first.chapterNum}:${firstVerse}-${last.chapterNum}:${lastVerse}`,
					)
				}
			} else {
				refs.push(reading.bookName)
			}
		}

		for (const chapter of reading.chapters) {
			verses.push(...chapter.verses)
		}
	}

	return { reference: refs.join('; '), verses }
}

// The occasion a service is being prayed on. Drives conditional block resolution.
// dayTune and season come from the calendar; commemorations/feasts are placeholders for
// the next stages (saint-of-day, feast overrides).
interface OccasionContext {
	dayTune: DayTune
	season: NatureSeason
	// Weekday of the liturgical day (0 = Sunday … 6 = Saturday).
	weekday: number
	commemorations: string[]
	feasts: string[]
}

function matchesCondition(when: IncenseCondition | undefined, ctx: OccasionContext): boolean {
	if (!when) return true
	if (when.dayTune && when.dayTune !== ctx.dayTune) return false
	if (when.season && when.season !== ctx.season) return false
	if (when.weekday != null) {
		const wanted = Array.isArray(when.weekday) ? when.weekday : [when.weekday]
		if (!wanted.includes(ctx.weekday)) return false
	}
	if (when.commemoration) {
		const wanted = Array.isArray(when.commemoration) ? when.commemoration : [when.commemoration]
		if (!wanted.some((w) => ctx.commemorations.includes(w))) return false
	}
	if (when.feast) {
		const wanted = Array.isArray(when.feast) ? when.feast : [when.feast]
		if (!wanted.some((w) => ctx.feasts.includes(w))) return false
	}
	return true
}

// Additive resolution — every block whose condition matches is included, in order.
function resolveBlocks(blocks: IncenseConditionalBlock[], ctx: OccasionContext): IncenseContent[] {
	return blocks.filter((b) => matchesCondition(b.when, ctx)).flatMap((b) => b.content)
}

// Rubric for an out-of-season nature litany offered as an optional extra, in the
// response's content language. Coptic falls back to English: rubrics are staging
// directions, not chanted text, and have no liturgical-Coptic convention.
const OUT_OF_SEASON_RUBRIC: Partial<Record<BibleTranslation, string>> = {
	en: 'Out of season.',
	ar: 'في غير موسمها.',
}

export function getIncenseForDate(
	date: Date,
	serviceType: IncenseServiceType = 'evening',
	translation: BibleTranslation = 'en',
	// Commemorations the user selected (e.g. their church's patron saint). Composed on top
	// of the calendar's commemorations for the day.
	selectedCommemorations: string[] = [],
): ResolvedIncenseService {
	const service =
		translation === 'ar'
			? getArIncenseService(serviceType)
			: translation === 'cop'
				? getCopIncenseService(serviceType)
				: getEnIncenseService(serviceType)
	const readings = getByCopticDate(date, true, translation)
	const vPsalm = readings.VPsalm ?? []
	const vGospel = readings.VGospel ?? []
	const psalm = flattenReadings(vPsalm)
	const gospel = flattenReadings(vGospel)

	// The day's occasion drives conditional block resolution: dayTune (calendar math) plus the
	// commemorations/feasts of the day, taken from the existing celebration calendar — not
	// recomputed here. e.g. every Coptic 29th → "annunciation-nativity-and-resurrection".
	const liturgical = getLiturgicalContext(date)
	const celebrations = getStaticCelebrationsForDay(date) ?? []
	const occasion: OccasionContext = {
		dayTune: liturgical.dayTune,
		season: liturgical.natureSeason,
		weekday: liturgical.dayOfWeek,
		commemorations: [
			...celebrations.map((c) => toCommemorationKey(c.name)),
			...selectedCommemorations,
		],
		feasts: celebrations
			.filter((c) => c.type.toLowerCase().includes('feast'))
			.map((c) => toCommemorationKey(c.name)),
	}

	const sections: ResolvedIncenseSection[] = service.sections.flatMap(
		(section: IncenseSectionData): ResolvedIncenseSection[] => {
			if (section.type === 'psalm') {
				const s = section as IncensePsalmSection
				const resolved = resolvePsalm(s.psalmRef, translation)
				return [
					{
						id: s.id,
						type: 'psalm' as const,
						role: s.role,
						title: s.title,
						rubric: s.rubric,
						reference: resolved?.reference ?? `Psalm ${s.psalmRef.psalmNumber}`,
						verses: resolved?.verses ?? [],
					},
				]
			}

			if (section.type === 'gospel') {
				const s = section as IncenseGospelSection
				return [
					{
						id: s.id,
						type: 'gospel' as const,
						role: s.role,
						title: s.title,
						reference: gospel.reference,
						verses: gospel.verses,
					},
				]
			}

			if (section.type === 'daily-psalm') {
				const s = section as IncenseDailyPsalmSection
				return [
					{
						id: s.id,
						type: 'psalm' as const,
						role: s.role,
						title: s.title,
						reference: psalm.reference,
						verses: psalm.verses,
					},
				]
			}

			const s = section as IncensePrayerSection
			const resolved: ResolvedPrayerSection = {
				id: s.id,
				type: s.type,
				role: s.role,
				title: s.title,
				rubric: s.rubric,
				...(s.optional ? { optional: true } : {}),
				content: s.blocks ? resolveBlocks(s.blocks, occasion) : (s.content ?? []),
			}

			// Season-keyed blocks that don't match today (the out-of-season nature litanies)
			// are still offered, as optional sections right after the in-season one — some
			// clergy add them regardless of the agricultural calendar. Tune/commemoration
			// variants are NOT surfaced this way: tunes are mutually exclusive by definition
			// and commemorations have their own picker.
			const outOfSeason = (s.blocks ?? [])
				.filter((b) => b.when?.season && b.when.season !== occasion.season)
				.map(
					(b): ResolvedPrayerSection => ({
						id: `${s.id}-${b.when?.season}`,
						type: s.type,
						role: s.role,
						title: b.title ?? s.title,
						rubric: OUT_OF_SEASON_RUBRIC[translation] ?? OUT_OF_SEASON_RUBRIC.en,
						optional: true,
						content: b.content,
					}),
				)

			return [resolved, ...outOfSeason]
		},
	)

	return {
		type: service.id,
		name: service.name,
		date: date.toISOString().substring(0, 10),
		copticDate: liturgical.copticDate,
		sections,
	}
}

// The distinct commemoration keys that have verses in this service — i.e. the saints/occasions
// a user can pick from for "the saint of the church". Derived from the data, so adding a
// conditional block makes the option appear in the picker automatically.
export function getAvailableCommemorations(serviceType: IncenseServiceType = 'evening'): string[] {
	const keys = new Set<string>()
	for (const section of getEnIncenseService(serviceType).sections) {
		const blocks = (section as IncensePrayerSection).blocks
		if (!blocks) continue
		for (const block of blocks) {
			const c = block.when?.commemoration
			if (!c) continue
			for (const key of Array.isArray(c) ? c : [c]) keys.add(key)
		}
	}
	return [...keys].sort()
}
