import type {
	IncenseSectionData,
	IncenseSectionRole,
	IncenseServiceData,
	IncenseServiceType,
} from '../../en/incense'
import incenseData from './incense.json'

export type { IncenseSectionRole, IncenseSectionData, IncenseServiceData, IncenseServiceType }

const data = incenseData as Record<IncenseServiceType, IncenseServiceData>

export function getIncenseService(serviceType: IncenseServiceType): IncenseServiceData {
	return data[serviceType]
}
