import { gregorianToCoptic, type SynaxariumEntry, type SynaxariumSynaxariumSearchResult } from '@coptic/core'
import synaxariumReadings from '../resources/synxarium.json'

export const getSynaxariumForDate = (date: Date, includeText = false): SynaxariumEntry[] | null => {
	const copticDate = gregorianToCoptic(date)
	const synxariumKey = `${copticDate.day} ${copticDate.monthString}`
	const synxarium = (synaxariumReadings as Record<string, SynaxariumEntry[]>)[synxariumKey]

	if (!synxarium) {
		return null
	}

	if (!includeText) {
		return synxarium.map((reading: SynaxariumEntry) => {
			const { _: _unused, text: _text, ...rest } = reading
			return rest
		})
	}

	return synxarium
}

export const searchSynaxarium = (searchTerm: string, limit = 50): SynaxariumSearchResult[] => {
	const results: SynaxariumSearchResult[] = []
	const searchLower = searchTerm.toLowerCase()

	Object.entries(synaxariumReadings as Record<string, SynaxariumEntry[]>).forEach(
		([key, entries]) => {
			entries.forEach((entry) => {
				if (entry.name?.toLowerCase().includes(searchLower)) {
					const parts = key.split(' ')
					const day = parts[0]
					const monthParts = parts.slice(1)
					const monthString = monthParts.join(' ')

					if (!day) {
						return
					}

					results.push({
						date: key,
						copticDate: {
							dateString: key,
							day: Number.parseInt(day),
							monthString,
						},
						entry: {
							url: entry.url,
							name: entry.name,
						},
					})
				}
			})
		},
	)

	return results.slice(0, limit)
}
