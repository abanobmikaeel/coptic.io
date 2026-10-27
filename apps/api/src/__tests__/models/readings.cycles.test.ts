import { getReadingCycle } from '@coptic/core'
import { describe, expect, it } from 'vitest'
import { getByCopticDate, parseReadingString } from '../../models/readings'
import holyFiftyReadings from '../../resources/holyFiftyReadings.json'
import sundayReadings from '../../resources/sundayReadings.json'

type Entry = Record<string, string>
const sundays = sundayReadings as Record<string, Entry>
const holyFifty = holyFiftyReadings as Record<string, Entry>

const local = (y: number, m: number, d: number) => new Date(y, m - 1, d)

describe('Sunday readings', () => {
	it('reads the second Sunday of Baba on 8 Baba, not the 8 Baba weekday readings', () => {
		const result = getByCopticDate(local(2026, 10, 18), false)

		expect(result.cycle).toBe('sunday')
		expect(result.readingsAvailable).toBe(true)
		expect(result.seasonDay).toBe('Second Sunday of Baba')
		expect(result.reference).toMatchObject({
			VGospel: 'Matthew 17:24-27',
			MGospel: 'Mark 16:2-8',
			Pauline: '2 Corinthians 4:5-15',
			Acts: 'Acts 14:24-28;Acts 15:1-3',
			LGospel: 'Luke 5:1-11',
		})
		expect(result.reference?.id).toBeUndefined()
	})

	it.each(['en', 'ar', 'es', 'cop'] as const)('resolves Sunday verse text in %s', (lang) => {
		const result = getByCopticDate(local(2026, 10, 18), true, lang)

		expect(result.LGospel?.[0].chapters[0].chapterNum).toBe(5)
		expect(result.LGospel?.[0].chapters[0].verses.length).toBe(11)
		expect(result.Pauline?.[0].chapters[0].verses[0].text).toBeTruthy()
	})

	it('reads the monthly commemoration on a Sunday the 29th', () => {
		// 29 Hatour 1741
		const result = getByCopticDate(local(2024, 12, 8), false)

		expect(result.cycle).toBe('annual')
		expect(result.reference?.LGospel).toBe('Luke 1:26-38')
	})
})

describe('Holy Week', () => {
	it('reports the Pascha readings as unavailable instead of serving the fixed day', () => {
		const result = getByCopticDate(local(2027, 4, 26), true)

		expect(result.cycle).toBe('holyWeek')
		expect(result.readingsAvailable).toBe(false)
		expect(result.season).toBe('Holy Week')
		expect(result.reference).toBeUndefined()
		expect(result.LGospel).toBeUndefined()
		expect(result.Synaxarium).toBeDefined()
	})
})

describe('Holy Fifty readings', () => {
	it.each([
		[local(2027, 5, 2), 'Feast of the Resurrection', 'John 20:1-18'],
		[local(2027, 5, 9), 'Thomas Sunday', 'John 20:19-31'],
		[local(2027, 6, 10), 'Feast of the Ascension', 'Luke 24:36-53'],
		[local(2027, 6, 20), 'Feast of Pentecost', 'John 15:26-16:15'],
	])('%s is the %s', (date, label, gospel) => {
		const result = getByCopticDate(date, false)

		expect(result.cycle).toBe('holyFifty')
		expect(result.season).toBe('Paschal Season')
		expect(result.seasonDay).toBe(label)
		expect(result.reference?.LGospel).toBe(gospel)
	})

	it('names a weekday by its week', () => {
		expect(getByCopticDate(local(2027, 5, 4), false).seasonDay).toBe(
			'Tuesday of the first week of the Holy Fifty Days',
		)
	})
})

describe('Katameros references', () => {
	// The Katameros numbers psalms by the Septuagint; these must be read as their
	// English-numbered equivalents, not the Septuagint number carried over.
	it.each([
		[sundays['5:4'].label, 'MPsalm', 'Psalms 80:7;Psalms 80:18'],
		[sundays['5:2'].label, 'LPsalm', 'Psalms 84:7;Psalms 65:2'],
		[sundays['11:3'].label, 'MPsalm', 'Psalms 135:1-2'],
		[holyFifty['45'].label, 'VPsalm', 'Psalms 119:130'],
		[holyFifty['39'].label, 'LPsalm', 'Psalms 24:9-10'],
		[holyFifty['38'].label, 'Pauline', 'Romans 7:1-7'],
		[holyFifty['3'].label, 'MGospel', 'John 1:9-14'],
	])('%s reads %s as %s', (label, slot, reference) => {
		const entry = [...Object.values(sundays), ...Object.values(holyFifty)].find(
			(e) => e.label === label,
		)
		expect(entry?.[slot]).toBe(reference)
	})
})

describe('Lectionary coverage', () => {
	it('has an entry for every Sunday and Holy Fifty day from 1950 to 2150', () => {
		const missing = new Set<string>()
		for (let d = local(1950, 1, 1); d.getFullYear() <= 2150; d.setDate(d.getDate() + 1)) {
			const cycle = getReadingCycle(d)
			if (cycle.cycle === 'sunday' && !sundays[`${cycle.month}:${cycle.sunday}`])
				missing.add(`Sunday ${cycle.month}:${cycle.sunday}`)
			if (cycle.cycle === 'holyFifty' && !holyFifty[String(cycle.daysFromEaster)])
				missing.add(`Holy Fifty ${cycle.daysFromEaster}`)
		}
		expect([...missing]).toEqual([])
	})

	it('covers the Holy Fifty from Easter to Pentecost without gaps', () => {
		expect(Object.keys(holyFifty).map(Number)).toEqual(Array.from({ length: 50 }, (_, i) => i))
	})

	it('names every Sunday and Holy Fifty day uniquely', () => {
		const labels = [...Object.values(sundays), ...Object.values(holyFifty)].map((e) => e.label)
		expect(new Set(labels).size).toBe(labels.length)
	})

	it('has the Liturgy readings on every day', () => {
		for (const entry of [...Object.values(sundays), ...Object.values(holyFifty)]) {
			for (const slot of ['Pauline', 'Catholic', 'Acts', 'LPsalm', 'LGospel']) {
				expect(entry[slot], `${entry.label} ${slot}`).toBeTruthy()
			}
		}
	})

	it.each(['en', 'ar'] as const)('resolves every reference to verses in %s', (lang) => {
		const unresolved: string[] = []
		for (const entry of [...Object.values(sundays), ...Object.values(holyFifty)]) {
			for (const [slot, ref] of Object.entries(entry)) {
				if (slot === 'label') continue
				const parts = ref.split(';')
				const readings = parseReadingString(ref, lang)
				const verses = readings?.flatMap((r) => r.chapters.flatMap((c) => c.verses)) ?? []
				if (readings?.length !== parts.length || verses.some((v) => !v.text))
					unresolved.push(`${entry.label} ${slot}: ${ref}`)
			}
		}
		expect(unresolved).toEqual([])
	})
})
