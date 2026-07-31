import { createTasbehaLoader } from '../../tasbeha/compose'
import common from './common.json'
import friday from './friday.json'
import monday from './monday.json'
import saturday from './saturday.json'
import sunday from './sunday.json'
import thursday from './thursday.json'
import tuesday from './tuesday.json'
import wednesday from './wednesday.json'

// Ordering is the week as prayed; the loader reads each service's id from its own file.
const loader = createTasbehaLoader(
	[sunday, monday, tuesday, wednesday, thursday, friday, saturday],
	common,
)

export const TASBEHA_SERVICE_IDS = loader.serviceIds()
export const getTasbehaService = loader.getService
export const getTasbehaServiceForWeekday = loader.getServiceForWeekday

export type * from '../../tasbeha/types'
