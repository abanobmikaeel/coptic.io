import { describe, expect, it } from 'vitest'
import { AgpeyaMidnightHourSchema } from '../../schemas'
import { type ResolvedMidnightHour, getAgpeyaHour } from '../../services/agpeya.service'

const midnight = (translation: 'en' | 'ar') =>
	getAgpeyaHour('midnight', translation) as ResolvedMidnightHour

describe('Agpeya midnight ending', () => {
	it.each(['en', 'ar'] as const)('resolves the ending gospel text in %s', (lang) => {
		const gospel = midnight(lang).conclusion?.find((s) => s.kind === 'gospel')
		expect(gospel && 'verses' in gospel && gospel.verses.length).toBeGreaterThan(0)
		expect(gospel && 'reference' in gospel && gospel.reference).toBeTruthy()
	})

	it('prays the same ending in English and Arabic', () => {
		const ids = (lang: 'en' | 'ar') => midnight(lang).conclusion?.map((s) => s.id)
		expect(ids('ar')).toEqual(ids('en'))
	})

	it.each(['en', 'ar'] as const)('matches the published %s response schema', (lang) => {
		expect(AgpeyaMidnightHourSchema.safeParse(midnight(lang)).success).toBe(true)
	})
})

describe('Agpeya midnight watches', () => {
	it.each(['en', 'ar'] as const)('ends the first two watches with their prayers in %s', (lang) => {
		const endings = midnight(lang).watches.map((w) => (w.conclusion ?? []).map((s) => s.id))
		expect(endings).toEqual([
			['kyrie41', 'holy-holy-holy', 'lords-prayer'],
			['kyrie41', 'holy-holy-holy', 'lords-prayer'],
			[],
		])
	})
})
