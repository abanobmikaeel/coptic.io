import type { LentDevotionalReading } from '@coptic/core'

export type { LentDevotionalReading }

export const loadLentDevotional = async (): Promise<LentDevotionalReading[]> =>
	((await import('./devotional.json')) as { default: LentDevotionalReading[] }).default
