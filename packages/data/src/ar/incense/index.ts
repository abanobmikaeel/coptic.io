import type {
	IncenseSectionData,
	IncenseSectionRole,
	IncenseServiceData,
	IncenseServiceType,
} from '../../en/incense'
import { type IncenseDataFile, createIncenseLoader } from '../../incense/compose'
import incenseData from './incense.json'

export type { IncenseSectionRole, IncenseSectionData, IncenseServiceData, IncenseServiceType }

const loader = createIncenseLoader(incenseData as unknown as IncenseDataFile)

export const getIncenseService = loader.getService
export const getIncenseServiceTypes = loader.serviceTypes
