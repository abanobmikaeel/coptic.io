import synaxariumReadings from '../resources/synxarium.json'
import fromGregorian from '../utils/copticDate'

export const getSynaxariumForDate = (date: Date, includeText: boolean = false) => {
	const copticDate = fromGregorian(date)
	const synxariumKey = `${copticDate.day} ${copticDate.monthString}`
	const synxarium = (synaxariumReadings as Record<string, any>)[synxariumKey]

	if (!synxarium) {
		return null
	}

	if (!includeText) {
		return synxarium.map((reading: any) => {
			const { text, ...rest } = reading
			return rest
		})
	}

	return synxarium
}

export const searchSynaxarium = (searchTerm: string, limit: number = 50) => {
	const results: any[] = []
	const searchLower = searchTerm.toLowerCase()

	Object.entries(synaxariumReadings as Record<string, any[]>).forEach(
		([key, entries]) => {
			entries.forEach((entry) => {
				if (entry.name.toLowerCase().includes(searchLower)) {
					const [day, ...monthParts] = key.split(' ')
					const monthString = monthParts.join(' ')

					results.push({
						date: key,
						copticDate: {
							dateString: key,
							day: parseInt(day),
							monthString,
						},
						entry: {
							url: entry.url,
							name: entry.name,
						},
					})
				}
			})
		}
	)

	return results.slice(0, limit)
}
