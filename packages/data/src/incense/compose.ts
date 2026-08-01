import type { IncenseSectionData, IncenseServiceData, IncenseServiceType } from '../en/incense'

/**
 * The stored shape: one pool of sections, and a per-service order naming them.
 *
 * Matins and Vespers are the same rite with different slots — the source keeps them
 * under a single order, and they differ only in which litanies are proper, which
 * gospel response is sung, and which of the day's readings fills the psalm and the
 * gospel. A section therefore belongs to the pool rather than to a service, and
 * `optional` is a property of the *order entry*: the litanies of the sick,
 * travellers and oblations are proper at Matins and an optional addition at Vespers.
 */
export interface IncenseOrderEntry {
	id: string
	optional?: boolean
}

export interface IncenseDataFile {
	sections: Record<string, IncenseSectionData>
	services: Record<
		IncenseServiceType,
		{ id: string; name: string; description: string; order: (string | IncenseOrderEntry)[] }
	>
}

/**
 * Resolves a service's order against the shared pool, composed once and cached so
 * callers share one object rather than rebuilding it on every request.
 */
export function createIncenseLoader(file: IncenseDataFile) {
	const cache = new Map<IncenseServiceType, IncenseServiceData>()

	return {
		serviceTypes: () => Object.keys(file.services) as IncenseServiceType[],

		getService(serviceType: IncenseServiceType): IncenseServiceData {
			const cached = cache.get(serviceType)
			if (cached) return cached

			const service = file.services[serviceType]
			if (!service) throw new Error(`Unknown incense service: ${serviceType}`)

			const sections = service.order.map((entry): IncenseSectionData => {
				const { id, optional } = typeof entry === 'string' ? { id: entry, optional: false } : entry
				const section = file.sections[id]
				if (!section) throw new Error(`${serviceType}: unresolved section "${id}"`)
				return optional ? ({ ...section, optional: true } as IncenseSectionData) : section
			})

			const resolved = {
				id: service.id,
				name: service.name,
				description: service.description,
				sections,
			} as IncenseServiceData
			cache.set(serviceType, resolved)
			return resolved
		},
	}
}
