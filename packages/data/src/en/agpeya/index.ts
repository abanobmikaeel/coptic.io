import { createAgpeyaLoader } from '../../agpeya/compose'
import type { AgpeyaCommonFile, AgpeyaHourFile, AgpeyaHourId } from '../../agpeya/types'
import common from './common.json'
import compline from './compline.json'
import midnight from './midnight.json'
import none from './none.json'
import prime from './prime.json'
import sext from './sext.json'
import terce from './terce.json'
import vespers from './vespers.json'

const files = { prime, terce, sext, none, vespers, compline, midnight } as unknown as Record<
	AgpeyaHourId,
	AgpeyaHourFile
>

const loader = createAgpeyaLoader(files, common as unknown as AgpeyaCommonFile)

export const getAgpeyaHourIds = loader.hourIds
/** The resolved hour in prayed sequence — the shape that replaces the slots. */
export const getAgpeyaHour = loader.getHour
export const getAgpeyaHourData = loader.getHourData
export const getAllAgpeyaHours = loader.getAllHours
export const getCommonPrayer = loader.getCommonPrayer
export const getAllCommonPrayers = loader.commonSections

export { isMidnightHour } from '../../agpeya/legacy'
export type * from '../../agpeya/legacy'
export type * from '../../agpeya/types'
