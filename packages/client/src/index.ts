/**
 * @coptic/client - API client for the Coptic.io API
 *
 * A lightweight, typed client for interacting with the Coptic.io API.
 *
 * @example
 * ```typescript
 * import { CopticClient } from '@coptic/client'
 *
 * const client = new CopticClient()
 *
 * // Get today's readings
 * const readings = await client.readings.today()
 *
 * // Get synaxarium entries
 * const synaxarium = await client.synaxarium.today()
 *
 * // Check fasting
 * const fasting = await client.fasting.today()
 * console.log(fasting.isFasting ? 'Fasting day' : 'Non-fasting day')
 * ```
 *
 * @packageDocumentation
 */

export {
	CopticClient,
	CopticApiError,
	type CopticClientConfig,
	type ReadingsOptions,
	type SynaxariumOptions,
	type CalendarOptions,
} from './client'

// Re-export core types for convenience
export type {
	CopticDate,
	GregorianDate,
	DualDate,
	BibleVerse,
	BibleChapter,
	BibleBook,
	Reading,
	DailyReadings,
	Feast,
	FeastType,
	Celebration,
	SynaxariumEntry,
	FastingInfo,
	CalendarDay,
	CalendarMonth,
	LiturgicalSeason,
} from '@coptic/core'
