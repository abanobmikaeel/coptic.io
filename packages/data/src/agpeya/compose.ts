import { type AgpeyaHourData, type AgpeyaMidnightHour, toLegacyHour } from './legacy'
import {
	type AgpeyaCommonFile,
	type AgpeyaHourFile,
	type AgpeyaHourId,
	type AgpeyaHourService,
	type AgpeyaPart,
	type AgpeyaResolvedGroup,
	type AgpeyaSection,
	isOrderGroup,
} from './types'

/**
 * Resolves an hour's `order` against its own propers first, then the shared
 * pool. Composed once per hour and cached, so callers share one fully-resolved
 * object rather than rebuilding the psalter on every request.
 */
export function createAgpeyaLoader(
	files: Record<AgpeyaHourId, AgpeyaHourFile>,
	common: AgpeyaCommonFile,
) {
	const hourIds = Object.keys(files) as AgpeyaHourId[]
	const cache = new Map<AgpeyaHourId, AgpeyaHourService>()

	function compose(id: AgpeyaHourId): AgpeyaHourService {
		const cached = cache.get(id)
		if (cached) return cached

		const file = files[id]
		const propers = new Map(file.sections.map((section) => [section.id, section]))
		const resolve = (sectionId: string): AgpeyaSection => {
			const section = propers.get(sectionId) ?? common.sections[sectionId]
			if (!section) throw new Error(`${id}: unresolved section "${sectionId}"`)
			return section
		}

		const parts: AgpeyaPart[] = file.order.map((entry) =>
			isOrderGroup(entry)
				? ({
						group: entry.group,
						name: entry.name,
						...(entry.theme ? { theme: entry.theme } : {}),
						...(entry.psalmsIntro ? { psalmsIntro: entry.psalmsIntro } : {}),
						sections: entry.order.map(resolve),
					} satisfies AgpeyaResolvedGroup)
				: resolve(entry),
		)

		const hour: AgpeyaHourService = {
			id: file.id,
			language: file.language,
			name: file.name,
			englishName: file.englishName,
			traditionalTime: file.traditionalTime,
			...(file.introduction ? { introduction: file.introduction } : {}),
			...(file.psalmsIntro ? { psalmsIntro: file.psalmsIntro } : {}),
			parts,
		}
		cache.set(id, hour)
		return hour
	}

	const getHour = (id: AgpeyaHourId): AgpeyaHourService | null =>
		hourIds.includes(id) ? compose(id) : null

	// The legacy projection lives here rather than in each language entry point: the
	// languages differ only in their text, so duplicating the accessors per language
	// is how the two drift apart.
	const getHourData = (id: AgpeyaHourId): AgpeyaHourData | AgpeyaMidnightHour | null => {
		const hour = getHour(id)
		return hour ? toLegacyHour(hour) : null
	}

	return {
		hourIds: () => [...hourIds],
		getHour,
		getHourData,
		getAllHours: (): (AgpeyaHourData | AgpeyaMidnightHour)[] =>
			hourIds
				.map(getHourData)
				.filter((hour): hour is AgpeyaHourData | AgpeyaMidnightHour => hour !== null),
		/** Only prose prayers are addressable standalone; psalms and gospels carry no `content`. */
		getCommonPrayer: (prayerId: string) => {
			const section = common.sections[prayerId] ?? null
			return section && 'content' in section ? section : null
		},
		getCommonSection: (sectionId: string): AgpeyaSection | null =>
			common.sections[sectionId] ?? null,
		commonSections: () => common.sections,
	}
}
