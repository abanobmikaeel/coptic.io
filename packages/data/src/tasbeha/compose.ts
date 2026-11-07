import type {
	TasbehaCommonFile,
	TasbehaKiahkFile,
	TasbehaSection,
	TasbehaServiceData,
	TasbehaServiceFile,
	TasbehaServiceId,
} from './types'

/**
 * Resolves a service's `order` against its own propers first, then the shared
 * pool. Composed once per service and cached, so callers share one fully-resolved
 * object rather than rebuilding the Psalmody on every request.
 *
 * Every language resolves the same section ids against its own text, so this
 * lives here once instead of being copied into each `{lang}/tasbeha/index.ts`.
 *
 * Inputs are `unknown` because TypeScript widens the types it infers for imported
 * JSON (`string` where the schema means a literal union), so the assertion belongs
 * here once rather than at all three language entry points.
 */
export function createTasbehaLoader(
	serviceFiles: readonly unknown[],
	commonFile: unknown,
	kiahkFile: unknown,
) {
	const files = serviceFiles as readonly TasbehaServiceFile[]
	const common = commonFile as TasbehaCommonFile
	const kiahk = kiahkFile as TasbehaKiahkFile

	// Keyed off each file's own id, so the wiring cannot disagree with the data.
	const byId = new Map(files.map((file) => [file.id, file]))
	const serviceIds = files.map((file) => file.id)
	const resolved = new Map<TasbehaServiceId, TasbehaServiceData>()
	const resolvedKiahk = new Map<string, TasbehaServiceData>()

	function compose(file: TasbehaServiceFile): TasbehaServiceData {
		const cached = resolved.get(file.id)
		if (cached) return cached

		const propers = new Map(file.sections.map((section) => [section.id, section]))
		const sections = file.order.map((sectionId): TasbehaSection => {
			const section = propers.get(sectionId) ?? common.sections[sectionId]
			if (!section) throw new Error(`${file.id}: unresolved section "${sectionId}"`)
			return section
		})

		const service: TasbehaServiceData = {
			id: file.id,
			language: file.language,
			name: file.name,
			description: file.description,
			rite: file.rite,
			status: file.status,
			sections,
		}
		resolved.set(file.id, service)
		return service
	}

	/** The annual order with the Kiahk hymns of this service's day placed in it. */
	function kiahkOrder(file: TasbehaServiceFile, week: number): string[] {
		const exposition = kiahk.expositions[week - 1] as string
		if (file.id === 'saturday-vespers-praises') {
			return kiahk.saturdayOrder.map((id) => (id === 'exposition' ? exposition : id))
		}
		const order = [...file.order]
		for (const { section, weekdays, before, after } of kiahk.additions) {
			if (!weekdays.some((weekday) => file.rite.weekdays.includes(weekday))) continue
			const anchor = order.indexOf((before ?? after) as string)
			if (anchor < 0) throw new Error(`${file.id}: no anchor for "${section}"`)
			order.splice(before ? anchor : anchor + 1, 0, section)
		}
		return order
	}

	function composeKiahk(file: TasbehaServiceFile, week: number): TasbehaServiceData {
		const key = `${file.id}:${week}`
		const cached = resolvedKiahk.get(key)
		if (cached) return cached

		const propers = new Map(file.sections.map((section) => [section.id, section]))
		const service: TasbehaServiceData = {
			id: file.id,
			language: file.language,
			name: `${file.name}${kiahk.nameSuffix}`,
			description: kiahk.description,
			rite: { ...file.rite, cycle: 'kiahk' },
			status: kiahk.status,
			sections: kiahkOrder(file, week).map((sectionId): TasbehaSection => {
				const section =
					kiahk.sections[sectionId] ?? propers.get(sectionId) ?? common.sections[sectionId]
				if (!section) throw new Error(`${file.id}: unresolved section "${sectionId}"`)
				return section
			}),
		}
		resolvedKiahk.set(key, service)
		return service
	}

	const byWeekday = new Map(
		files.flatMap((file) => file.rite.weekdays.map((weekday) => [weekday, file] as const)),
	)

	return {
		serviceIds: (): TasbehaServiceId[] => [...serviceIds],

		getService: (id: TasbehaServiceId = 'sunday-midnight-praises'): TasbehaServiceData => {
			const file = byId.get(id)
			if (!file) throw new Error(`Unknown Tasbeha service: ${id}`)
			return compose(file)
		},

		/** The service in Kiahk's `week` (1–4), with the month's hymns in place. */
		getKiahkService: (id: TasbehaServiceId, week: number): TasbehaServiceData => {
			const file = byId.get(id)
			if (!file) throw new Error(`Unknown Tasbeha service: ${id}`)
			return composeKiahk(file, week)
		},

		/** `weekday` follows `Date.getDay()` — 0 is Sunday. */
		getServiceForWeekday: (weekday: number): TasbehaServiceData => {
			const file = byWeekday.get(weekday)
			if (!file) throw new Error(`No Tasbeha service for weekday ${weekday}`)
			return compose(file)
		},
	}
}
