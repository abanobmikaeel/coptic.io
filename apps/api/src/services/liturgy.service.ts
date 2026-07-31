import { gregorianToCoptic } from '@coptic/core'
import { getLiturgyService as getArLiturgyService } from '@coptic/data/ar/liturgy'
import { getLiturgyService as getCopLiturgyService } from '@coptic/data/cop/liturgy'
import {
	type LiturgyContent,
	type LiturgyEpistleSection,
	type LiturgyPrayerSection,
	type LiturgyRite,
	type LiturgySectionRole,
	getLiturgyService as getEnLiturgyService,
} from '@coptic/data/en/liturgy'
import { getByCopticDate } from '../models/readings'
import type { BibleTranslation, BibleVerse, CopticDate } from '../types'
import { flattenReadings } from './readings-format'

export interface ResolvedLiturgyPrayerSection {
	id: string
	type: 'prayer' | 'litany' | 'creed'
	role: LiturgySectionRole
	title: string
	titleLanguage?: string
	rubric?: string
	content: LiturgyContent[]
}

/** A section whose text comes from the day's Katameros rather than the rite. */
export interface ResolvedLiturgyReadingSection {
	id: string
	type: 'psalm' | 'epistle' | 'gospel'
	role: LiturgySectionRole
	title: string
	titleLanguage?: string
	rubric?: string
	reference: string
	verses: BibleVerse[]
}

export type ResolvedLiturgySection = ResolvedLiturgyPrayerSection | ResolvedLiturgyReadingSection

export interface ResolvedLiturgyService {
	type: string
	name: string
	date: string
	copticDate: CopticDate
	sections: ResolvedLiturgySection[]
}

// Katameros key per epistle. "Praxis" is the Acts reading.
const EPISTLE_READING = {
	pauline: 'Pauline',
	catholic: 'Catholic',
	praxis: 'Acts',
} as const

const formatLocalDate = (d: Date) =>
	`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

const serviceFor = (translation: BibleTranslation, rite: LiturgyRite) =>
	translation === 'ar'
		? getArLiturgyService(rite)
		: translation === 'cop'
			? getCopLiturgyService(rite)
			: getEnLiturgyService(rite)

/**
 * The Liturgy in prayed order, with the day's readings filled in.
 *
 * The rite itself is fixed; only the psalm, the three epistles and the gospel
 * change with the date, and those come from the Katameros rather than the rite
 * data. A reading the lectionary does not carry for the day resolves to an empty
 * section rather than being dropped, so the three languages keep the same section
 * sequence and the reader can align them.
 */
export function getLiturgyForDate(
	date: Date,
	rite: LiturgyRite = 'basil',
	translation: BibleTranslation = 'en',
): ResolvedLiturgyService {
	const service = serviceFor(translation, rite)
	const readings = getByCopticDate(date, true, translation)

	const sections: ResolvedLiturgySection[] = service.sections.map((section) => {
		const base = {
			id: section.id,
			role: section.role,
			title: section.title,
			...(section.titleLanguage ? { titleLanguage: section.titleLanguage } : {}),
			...(section.rubric ? { rubric: section.rubric } : {}),
		}

		if (section.type === 'daily-psalm') {
			const psalm = flattenReadings(readings.LPsalm ?? [], translation)
			return { ...base, type: 'psalm' as const, ...psalm }
		}

		if (section.type === 'gospel') {
			const gospel = flattenReadings(readings.LGospel ?? [], translation)
			return { ...base, type: 'gospel' as const, ...gospel }
		}

		if (section.type === 'epistle') {
			const key = EPISTLE_READING[(section as LiturgyEpistleSection).reading]
			return {
				...base,
				type: 'epistle' as const,
				...flattenReadings(readings[key] ?? [], translation),
			}
		}

		const prayer = section as LiturgyPrayerSection
		return { ...base, type: prayer.type, content: prayer.content }
	})

	return {
		type: service.id,
		name: service.name,
		date: formatLocalDate(date),
		copticDate: gregorianToCoptic(date),
		sections,
	}
}
