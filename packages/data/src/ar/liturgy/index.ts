import type { LiturgyRite, LiturgySectionData, LiturgyServiceData } from '../../en/liturgy'
import liturgyData from './liturgy.json'

export type { LiturgyRite, LiturgySectionData, LiturgyServiceData }

const data = liturgyData as Record<LiturgyRite, LiturgyServiceData>

export function getLiturgyService(rite: LiturgyRite = 'basil'): LiturgyServiceData {
	return data[rite]
}
