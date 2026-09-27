import { getAgpeyaHour as getArOrderedHour } from '@coptic/data/ar/agpeya'
import { getAgpeyaHour as getEnOrderedHour } from '@coptic/data/en/agpeya'
import { describe, expect, it } from 'vitest'
import { AgpeyaHourSchema, AgpeyaMidnightHourSchema } from '../../schemas'
import type { ServedSection } from '../../services/agpeya-sections'
import { type ResolvedMidnightHour, getAgpeyaHour, getHourIds } from '../../services/agpeya.service'

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

describe('Agpeya gospel conclusion', () => {
	it.each(['en', 'ar'] as const)('serves it after the gospel of every watch in %s', (lang) => {
		for (const watch of midnight(lang).watches) {
			expect(watch.gospelConclusion?.content, watch.id).toHaveLength(2)
		}
	})

	it.each(['en', 'ar'] as const)('serves it after the daytime gospel in %s', (lang) => {
		const terce = getAgpeyaHour('terce', lang) as { gospelConclusion?: { content: string[] } }
		expect(terce.gospelConclusion?.content).toHaveLength(2)
	})
})

describe('Agpeya sections in prayed order', () => {
	const ids = (sections: ServedSection[]): string[] =>
		sections.flatMap((s) => (s.kind === 'watch' ? [s.id, ...s.sections.map((w) => w.id)] : [s.id]))

	it.each(['en', 'ar'] as const)(
		'serves every section of every hour, in data order, in %s',
		(lang) => {
			const ordered = lang === 'ar' ? getArOrderedHour : getEnOrderedHour
			for (const hourId of getHourIds()) {
				const expected = (ordered(hourId)?.parts ?? []).flatMap((p) =>
					'group' in p ? [p.group, ...p.sections.map((s) => s.id)] : [p.id],
				)
				const served = getAgpeyaHour(hourId, lang, 'septuagint', { sections: true }) as {
					sections: ServedSection[]
				}
				expect(ids(served.sections), `${lang} ${hourId}`).toEqual(expected)
			}
		},
	)

	// The slotted `gospel` field only ever carried the first reading.
	it('serves both of Terce’s gospels', () => {
		const terce = getAgpeyaHour('terce', 'en', 'septuagint', { sections: true }) as {
			sections: ServedSection[]
		}
		const gospels = terce.sections.filter((s) => s.kind === 'gospel')
		expect(gospels.map((g) => g.id)).toEqual(['terce-gospel', 'terce-gospel-2'])
		for (const g of gospels) expect('verses' in g && g.verses.length).toBeGreaterThan(0)
	})

	it('resolves psalms and gospels from the Bible for a scripture-only language', () => {
		const prime = getAgpeyaHour('prime', 'cop', 'septuagint', { sections: true }) as {
			sections: ServedSection[]
		}
		const scripture = prime.sections.filter((s) => s.kind === 'psalm' || s.kind === 'gospel')
		expect(scripture.length).toBeGreaterThan(0)
		for (const s of scripture) expect('verses' in s && s.verses.length, s.id).toBeGreaterThan(0)
	})

	it('leaves `sections` out unless asked, so existing responses are unchanged', () => {
		expect(getAgpeyaHour('terce', 'en')).not.toHaveProperty('sections')
	})

	it.each(['en', 'ar'] as const)('matches the published hour schema in %s', (lang) => {
		for (const hourId of getHourIds()) {
			const schema = hourId === 'midnight' ? AgpeyaMidnightHourSchema : AgpeyaHourSchema
			const result = schema.safeParse(getAgpeyaHour(hourId, lang, 'septuagint', { sections: true }))
			expect(result.success, `${lang} ${hourId}: ${result.error?.message}`).toBe(true)
		}
	})
})
