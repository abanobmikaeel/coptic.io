import synaxariumReadings from '../resources/synxarium.json'
import fromGregorian from '../utils/copticDate'

type SynaxariumEntry = {
	_?: string
	name?: string
	url?: string
	text?: string
	[key: string]: unknown
}

type SearchResult = {
	date: string
	copticDate: {
		dateString: string
		day: number
		monthString: string
	}
	entry: {
		url?: string
		name?: string
	}
}

export const getSynaxariumForDate = (date: Date, includeText = false): SynaxariumEntry[] | null => {
	const copticDate = fromGregorian(date)
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

export const searchSynaxarium = (searchTerm: string, limit = 50): SearchResult[] => {
	const results: SearchResult[] = []
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
