import type {
	TasbehaCommonFile,
	TasbehaSection,
	TasbehaServiceData,
	TasbehaServiceFile,
	TasbehaServiceId,
} from '../../tasbeha/types'
import commonData from './common.json'
import friday from './friday.json'
import monday from './monday.json'
import saturday from './saturday.json'
import sunday from './sunday.json'
import thursday from './thursday.json'
import tuesday from './tuesday.json'
import wednesday from './wednesday.json'

const common = commonData as unknown as TasbehaCommonFile

const files = {
	'sunday-midnight-praises': sunday,
	'monday-midnight-praises': monday,
	'tuesday-midnight-praises': tuesday,
	'wednesday-midnight-praises': wednesday,
	'thursday-midnight-praises': thursday,
	'friday-midnight-praises': friday,
	'saturday-vespers-praises': saturday,
} as unknown as Record<TasbehaServiceId, TasbehaServiceFile>

export const TASBEHA_SERVICE_IDS = Object.keys(files) as TasbehaServiceId[]

// Sections prayed on more than one day live in common.json, so a service is its
// `order` resolved against its own propers first, then the shared pool. Composed
// once per service and cached — callers get the same fully-resolved object every time.
const resolved = new Map<TasbehaServiceId, TasbehaServiceData>()

function compose(id: TasbehaServiceId): TasbehaServiceData {
	const cached = resolved.get(id)
	if (cached) return cached

	const file = files[id]
	const propers = new Map(file.sections.map((section) => [section.id, section]))
	const sections = file.order.map((sectionId): TasbehaSection => {
		const section = propers.get(sectionId) ?? common.sections[sectionId]
		if (!section) throw new Error(`${id}: unresolved section "${sectionId}"`)
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
	resolved.set(id, service)
	return service
}

const byWeekday = new Map(
	TASBEHA_SERVICE_IDS.flatMap((id) =>
		files[id].rite.weekdays.map((weekday) => [weekday, id] as const),
	),
)

export function getTasbehaService(
	id: TasbehaServiceId = 'sunday-midnight-praises',
): TasbehaServiceData {
	if (!files[id]) throw new Error(`Unknown Tasbeha service: ${id}`)
	return compose(id)
}

/** `weekday` follows `Date.getDay()` — 0 is Sunday. */
export function getTasbehaServiceForWeekday(weekday: number): TasbehaServiceData {
	const id = byWeekday.get(weekday)
	if (!id) throw new Error(`No Tasbeha service for weekday ${weekday}`)
	return compose(id)
}

export type {
	TasbehaCommonFile,
	TasbehaCycle,
	TasbehaDayTune,
	TasbehaLanguage,
	TasbehaRite,
	TasbehaSection,
	TasbehaSectionKind,
	TasbehaServiceData,
	TasbehaServiceFile,
	TasbehaServiceId,
	TasbehaSource,
} from '../../tasbeha/types'
