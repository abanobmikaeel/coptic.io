import { describe, expect, it } from 'vitest'
import * as ar from '../ar/tasbeha'
import * as cop from '../cop/tasbeha'
import * as en from '../en/tasbeha'
import type { TasbehaServiceId } from '../tasbeha/types'

const languages = { en, ar, cop }
const weeks = [1, 2, 3, 4]

describe('Kiahk Psalmody', () => {
	it.each(en.TASBEHA_SERVICE_IDS)('%s resolves in every language and week', (id) => {
		for (const week of weeks) {
			const orders = Object.values(languages).map((language) =>
				language.getKiahkTasbehaService(id, week).sections.map((section) => section.id),
			)
			expect(orders[1]).toEqual(orders[0])
			expect(orders[2]).toEqual(orders[0])
		}
	})

	it('marks each service partial and of the Kiahk cycle', () => {
		const service = en.getKiahkTasbehaService('monday-midnight-praises', 1)
		expect(service.status).toBe('partial')
		expect(service.rite.cycle).toBe('kiahk')
		expect(service.description).toContain('not available')
	})

	it('leaves the annual service untouched', () => {
		en.getKiahkTasbehaService('monday-midnight-praises', 1)
		const annual = en.getTasbehaService('monday-midnight-praises')
		expect(annual.status).toBe('complete')
		expect(annual.sections.map((s) => s.id)).not.toContain('kiahk-monday-adam-hymn')
	})

	it.each([1, 2, 3, 4])("reads only week %i's Exposition on Saturday", (week) => {
		const ids = en
			.getKiahkTasbehaService('saturday-vespers-praises', week)
			.sections.map((section) => section.id)
		expect(ids.filter((id) => id.startsWith('kiahk-exposition-week'))).toEqual([
			`kiahk-exposition-week-${week}`,
		])
	})

	it('keeps the nine Saturday Theotokia parts in order', () => {
		const parts = en
			.getKiahkTasbehaService('saturday-vespers-praises', 1)
			.sections.flatMap(({ id }) => id.match(/theotokia-part-(\d)/)?.[1] ?? [])
		expect(parts).toEqual(['1', '2', '3', '4', '5', '6', '7', '8', '9'])
	})

	it.each<[TasbehaServiceId, string, string]>([
		['sunday-midnight-praises', 'kiahk-third-hoos-adam-psali', 'third-hoos'],
		['sunday-midnight-praises', 'kiahk-fourth-hoos-adam-psali', 'fourth-hoos'],
		['tuesday-midnight-praises', 'kiahk-after-adam-theotokias-hymn', 'difnar-introduction-adam'],
	])('%s places %s before %s', (id, hymn, next) => {
		const ids = en.getKiahkTasbehaService(id, 1).sections.map((section) => section.id)
		expect(ids.indexOf(hymn)).toBeGreaterThan(-1)
		expect(ids.indexOf(hymn)).toBeLessThan(ids.indexOf(next))
	})

	it('keeps text and language honest, flagging what the source lacks', () => {
		for (const id of en.TASBEHA_SERVICE_IDS) {
			for (const [language, data] of Object.entries(languages)) {
				for (const section of data.getKiahkTasbehaService(id, 1).sections) {
					if (section.contentUnavailable) {
						expect(section.content, section.id).toEqual([])
						expect(language, section.id).not.toBe('ar')
					} else {
						expect(section.content.length, section.id).toBeGreaterThan(0)
					}
				}
			}
		}
	})

	it('holds real Coptic where a section has it', () => {
		const section = cop
			.getKiahkTasbehaService('sunday-midnight-praises', 1)
			.sections.find(({ id }) => id === 'kiahk-third-hoos-adam-psali')
		expect(section?.contentUnavailable).toBeUndefined()
		expect(section?.content.join('')).toMatch(/[Ⲁ-⳿]/i)
	})
})
