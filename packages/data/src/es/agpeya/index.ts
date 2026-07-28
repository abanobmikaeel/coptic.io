import type {
	AgpeyaDataStored,
	AgpeyaHour,
	AgpeyaHourData,
	AgpeyaHourId,
	AgpeyaMidnightHour,
	AgpeyaPrayerSection,
	AgpeyaPsalmRef,
	AgpeyaWatch,
} from '../../en/agpeya'
import agpeyaData from './agpeya.json'
import commonPrayers from './common.json'

export type {
	AgpeyaData,
	AgpeyaDataStored,
	AgpeyaGospel,
	AgpeyaGospelRef,
	AgpeyaHour,
	AgpeyaHourData,
	AgpeyaHourId,
	AgpeyaLitany,
	AgpeyaMidnightHour,
	AgpeyaPrayerSection,
	AgpeyaPsalm,
	AgpeyaPsalmRef,
	AgpeyaVerse,
	AgpeyaWatch,
	MidnightWatchId,
} from '../../en/agpeya'

export { isMidnightHour } from '../../en/agpeya'

const rawData = agpeyaData as unknown as AgpeyaDataStored

const WATCH_METADATA: Record<string, Pick<AgpeyaWatch, 'name' | 'theme'>> = {
	'midnight-1': { name: 'Primera Vigilia', theme: 'Vigilancia y preparación' },
	'midnight-2': { name: 'Segunda Vigilia', theme: 'Arrepentimiento y lágrimas' },
	'midnight-3': { name: 'Tercera Vigilia', theme: 'Juicio y esperanza' },
}

/**
 * The importer deliberately derives service structure from the established
 * English edition. Localize that non-liturgical metadata here while leaving
 * every imported Spanish prayer and Psalm untouched.
 */
function localizePsalmRef(ref: AgpeyaPsalmRef): AgpeyaPsalmRef {
	return {
		psalmNumber: ref.psalmNumber,
		title: `Salmo ${ref.psalmNumber}`,
		startVerse: ref.startVerse,
		endVerse: ref.endVerse,
	}
}

function localizeHour(hour: AgpeyaHourData): AgpeyaHourData {
	return {
		...hour,
		introductoryPsalm: hour.introductoryPsalm
			? localizePsalmRef(hour.introductoryPsalm)
			: undefined,
		psalmRefs: hour.psalmRefs.map(localizePsalmRef),
		gospelRef: { ...hour.gospelRef, rubric: undefined },
	}
}

const data: AgpeyaDataStored = {
	...rawData,
	hours: Object.fromEntries(
		Object.entries(rawData.hours).map(([id, hour]) => [id, localizeHour(hour)]),
	) as AgpeyaDataStored['hours'],
	midnight: {
		...rawData.midnight,
		introductoryPsalm: rawData.midnight.introductoryPsalm
			? localizePsalmRef(rawData.midnight.introductoryPsalm)
			: undefined,
		watches: rawData.midnight.watches.map((watch) => ({
			...watch,
			...WATCH_METADATA[watch.id],
			psalmRefs: watch.psalmRefs.map(localizePsalmRef),
			gospelRef: watch.gospelRef ? { ...watch.gospelRef, rubric: undefined } : undefined,
		})),
	},
}

export function getAgpeyaHourData(
	hourId: AgpeyaHourId,
): AgpeyaHourData | AgpeyaMidnightHour | null {
	return hourId === 'midnight' ? data.midnight : data.hours[hourId] || null
}

export function getAgpeyaHour(hourId: AgpeyaHourId): AgpeyaHour | null {
	return getAgpeyaHourData(hourId) as AgpeyaHour | null
}

export function getAllAgpeyaHours(): (AgpeyaHourData | AgpeyaMidnightHour)[] {
	return [...Object.values(data.hours), data.midnight]
}

export function getAgpeyaHourIds(): AgpeyaHourId[] {
	return [...Object.keys(data.hours), 'midnight'] as AgpeyaHourId[]
}

export function getCommonPrayer(prayerId: string): AgpeyaPrayerSection | null {
	return (commonPrayers as Record<string, AgpeyaPrayerSection>)[prayerId] || null
}

export function getAllCommonPrayers(): Record<string, AgpeyaPrayerSection> {
	return commonPrayers as Record<string, AgpeyaPrayerSection>
}

export { agpeyaData, commonPrayers }
