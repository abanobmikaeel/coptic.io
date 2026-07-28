import type { TasbehaServiceData } from '../../tasbeha/types'
import serviceData from './sunday.json'

const sundayMidnightPraises = serviceData as TasbehaServiceData

export function getTasbehaService(): TasbehaServiceData {
	return sundayMidnightPraises
}

export { sundayMidnightPraises }
export type {
	TasbehaCycle,
	TasbehaDayTune,
	TasbehaLanguage,
	TasbehaSection,
	TasbehaSectionKind,
	TasbehaServiceData,
	TasbehaSource,
} from '../../tasbeha/types'
