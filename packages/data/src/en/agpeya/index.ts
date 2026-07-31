import { createAgpeyaLoader } from '../../agpeya/compose'
import { type AgpeyaHourData, type AgpeyaMidnightHour, toLegacyHour } from '../../agpeya/legacy'
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

export function getAgpeyaHourData(
	hourId: AgpeyaHourId,
): AgpeyaHourData | AgpeyaMidnightHour | null {
	const hour = loader.getHour(hourId)
	return hour ? toLegacyHour(hour) : null
}

export function getAllAgpeyaHours(): (AgpeyaHourData | AgpeyaMidnightHour)[] {
	return getAgpeyaHourIds()
		.map(getAgpeyaHourData)
		.filter((hour): hour is AgpeyaHourData | AgpeyaMidnightHour => hour !== null)
}

export function getCommonPrayer(prayerId: string) {
	const section = loader.getCommonSection(prayerId)
	return section && 'content' in section ? section : null
}

export function getAllCommonPrayers() {
	return loader.commonSections()
}

export { isMidnightHour } from '../../agpeya/legacy'
export type {
	AgpeyaGospelRef,
	AgpeyaHourData,
	AgpeyaLitany,
	AgpeyaMidnightHour,
	AgpeyaPrayerSection,
	AgpeyaPsalm,
	AgpeyaPsalmRef,
	AgpeyaWatch,
} from '../../agpeya/legacy'
export type {
	AgpeyaCommonFile,
	AgpeyaGospelSection,
	AgpeyaHourFile,
	AgpeyaHourId,
	AgpeyaHourService,
	AgpeyaLanguage,
	AgpeyaOrderEntry,
	AgpeyaOrderGroup,
	AgpeyaPart,
	AgpeyaProseSection,
	AgpeyaPsalmSection,
	AgpeyaResolvedGroup,
	AgpeyaSection,
	AgpeyaSectionKind,
	AgpeyaVerse,
	MidnightWatchId,
} from '../../agpeya/types'
