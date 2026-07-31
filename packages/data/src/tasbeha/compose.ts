import type {
	TasbehaCommonFile,
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
export function createTasbehaLoader(serviceFiles: readonly unknown[], commonFile: unknown) {
	const files = serviceFiles as readonly TasbehaServiceFile[]
	const common = commonFile as TasbehaCommonFile

	// Keyed off each file's own id, so the wiring cannot disagree with the data.
	const byId = new Map(files.map((file) => [file.id, file]))
	const serviceIds = files.map((file) => file.id)
	const resolved = new Map<TasbehaServiceId, TasbehaServiceData>()

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

		/** `weekday` follows `Date.getDay()` — 0 is Sunday. */
		getServiceForWeekday: (weekday: number): TasbehaServiceData => {
			const file = byWeekday.get(weekday)
			if (!file) throw new Error(`No Tasbeha service for weekday ${weekday}`)
			return compose(file)
		},
	}
}
