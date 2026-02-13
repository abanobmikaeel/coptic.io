import type { ReadingsData } from './types'

// Reading metadata for mobile view
const mobileReadings = [
	{ key: 'Pauline', short: 'Pa', label: 'Pauline' },
	{ key: 'Catholic', short: 'Ca', label: 'Catholic' },
	{ key: 'Acts', short: 'Ac', label: 'Acts' },
	{ key: 'Synaxarium', short: 'Sx', label: 'Synax' },
	{ key: 'LPsalm', short: 'Ps', label: 'Psalm' },
	{ key: 'LGospel', short: 'Go', label: 'Gospel' },
] as const

// Reading metadata grouped by service (desktop view)
const readingGroups = [
	{
		label: 'Liturgy',
		readings: [
			{ key: 'Pauline', short: 'Pa', label: 'Pauline Epistle', size: 'md' as const },
			{ key: 'Catholic', short: 'Ca', label: 'Catholic Epistle', size: 'md' as const },
			{ key: 'Acts', short: 'Ac', label: 'Acts', size: 'md' as const },
			{ key: 'Synaxarium', short: 'Sx', label: 'Synaxarium', size: 'sm' as const },
			{ key: 'LPsalm', short: 'Ps', label: 'Psalm', size: 'sm' as const },
			{ key: 'LGospel', short: 'Go', label: 'Gospel', size: 'lg' as const },
		],
	},
	{
		label: 'Vespers',
		readings: [
			{ key: 'VPsalm', short: 'Ps', label: 'Psalm', size: 'sm' as const },
			{ key: 'VGospel', short: 'Go', label: 'Gospel', size: 'lg' as const },
		],
	},
	{
		label: 'Matins',
		readings: [
			{ key: 'MPsalm', short: 'Ps', label: 'Psalm', size: 'sm' as const },
			{ key: 'MGospel', short: 'Go', label: 'Gospel', size: 'lg' as const },
		],
	},
]

export type ReadingSize = 'sm' | 'md' | 'lg'

export interface ReadingItem {
	key: string
	short: string
	label: string
	size: ReadingSize
}

export interface ReadingGroup {
	label: string
	readings: ReadingItem[]
}

export interface MobileReadingItem {
	key: string
	short: string
	label: string
}

export interface AvailableSections {
	groups: ReadingGroup[]
	allReadings: ReadingItem[]
	mobileReadings: MobileReadingItem[]
}

function hasReadingData(readings: ReadingsData, key: string): boolean {
	// Synaxarium uses different key in data
	const dataKey = key
	const data = readings[dataKey as keyof ReadingsData]
	return data != null && Array.isArray(data) && data.length > 0
}

/**
 * Computes available reading sections based on what data exists.
 * Call this server-side to avoid client computation.
 */
export function getAvailableSections(readings: ReadingsData): AvailableSections {
	const groups = readingGroups
		.map((group) => ({
			label: group.label,
			readings: group.readings.filter((r) => hasReadingData(readings, r.key)),
		}))
		.filter((group) => group.readings.length > 0)

	const allReadings = groups.flatMap((g) => g.readings)

	const mobile = mobileReadings
		.filter((r) => hasReadingData(readings, r.key))
		.map((r) => ({ key: r.key, short: r.short, label: r.label }))

	return { groups, allReadings, mobileReadings: mobile }
}
