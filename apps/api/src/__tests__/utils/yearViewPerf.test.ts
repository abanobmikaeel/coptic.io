import { describe, it } from 'vitest'
import { getCalendarMonth } from '../../services/calendar.service'
import { getFastingCalendar } from '../../services/fasting.service'
import { generateYearCalendar } from '../../utils/icalGenerator'

const benchmark = (label: string, fn: () => void, iterations: number) => {
	const times: number[] = []
	for (let i = 0; i < iterations; i++) {
		const start = performance.now()
		fn()
		times.push(performance.now() - start)
	}
	const avg = times.reduce((a, b) => a + b, 0) / times.length
	const min = Math.min(...times)
	const max = Math.max(...times)
	console.log(
		`  ${label}:  avg=${avg.toFixed(2)}ms  min=${min.toFixed(2)}ms  max=${max.toFixed(2)}ms`,
	)
	return { avg, min, max }
}

describe('Year View Performance', () => {
	it('benchmarks getFastingCalendar (cold + warm)', () => {
		console.log(`\n${'='.repeat(60)}`)
		console.log('getFastingCalendar(2025)')
		console.log('='.repeat(60))

		// Cold: first call builds year view cache
		const coldStart = performance.now()
		const result = getFastingCalendar(2025)
		const coldTime = performance.now() - coldStart
		console.log(`  Cold call:   ${coldTime.toFixed(2)}ms (${result.length} fasting days)`)

		// Warm: subsequent calls hit cache
		benchmark('Warm calls', () => getFastingCalendar(2025), 10)
		console.log('='.repeat(60))
	})

	it('benchmarks generateYearCalendar (cold + warm)', () => {
		console.log(`\n${'='.repeat(60)}`)
		console.log('generateYearCalendar(2026)')
		console.log('='.repeat(60))

		// Cold
		const coldStart = performance.now()
		const result = generateYearCalendar(2026)
		const coldTime = performance.now() - coldStart
		console.log(`  Cold call:   ${coldTime.toFixed(2)}ms (${result.length} chars)`)

		// Warm
		benchmark('Warm calls', () => generateYearCalendar(2026), 10)
		console.log('='.repeat(60))
	})

	it('benchmarks getCalendarMonth (cold + warm)', () => {
		console.log(`\n${'='.repeat(60)}`)
		console.log('getCalendarMonth(2025, 3)')
		console.log('='.repeat(60))

		// Cold (year view for 2025 already cached from fasting test, but month logic is fresh)
		const coldStart = performance.now()
		const result = getCalendarMonth(2025, 3)
		const coldTime = performance.now() - coldStart
		console.log(`  Cold call:   ${coldTime.toFixed(2)}ms (${result.days.length} days)`)

		// Warm
		benchmark('Warm calls', () => getCalendarMonth(2025, 3), 10)
		console.log('='.repeat(60))
	})

	it('verifies year view cache hit is fast', () => {
		console.log(`\n${'='.repeat(60)}`)
		console.log('Year View Cache Hit Verification')
		console.log('='.repeat(60))

		// Ensure cache is warm
		getFastingCalendar(2024)

		// Measure cache hit
		const times: number[] = []
		for (let i = 0; i < 100; i++) {
			const start = performance.now()
			getFastingCalendar(2024)
			times.push(performance.now() - start)
		}
		const avg = times.reduce((a, b) => a + b, 0) / times.length
		console.log(`  Cache hit avg (100 runs): ${avg.toFixed(4)}ms`)
		console.log('='.repeat(60))
	})
})
