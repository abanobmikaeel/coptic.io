import { describe, it } from 'vitest'
import { generateMultiYearCalendar, generateYearCalendar } from '../../utils/icalGenerator'

describe('iCal Performance', () => {
	it('measures single year generation time', () => {
		const iterations = 10
		const times: number[] = []

		for (let i = 0; i < iterations; i++) {
			const start = performance.now()
			const cal = generateYearCalendar(2026)
			const end = performance.now()
			times.push(end - start)
		}

		const avg = times.reduce((a, b) => a + b, 0) / times.length
		const min = Math.min(...times)
		const max = Math.max(...times)
		const size = new Blob([generateYearCalendar(2026)]).size

		console.log('\n' + '='.repeat(60))
		console.log('SINGLE YEAR CALENDAR (2026)')
		console.log('='.repeat(60))
		console.log(`  Iterations:  ${iterations}`)
		console.log(`  Average:     ${avg.toFixed(2)}ms`)
		console.log(`  Min:         ${min.toFixed(2)}ms`)
		console.log(`  Max:         ${max.toFixed(2)}ms`)
		console.log(`  File size:   ${(size / 1024).toFixed(1)}KB`)
		console.log('='.repeat(60) + '\n')
	})

	it('measures multi-year subscription generation time', () => {
		const iterations = 10
		const times: number[] = []
		const currentYear = new Date().getFullYear()

		for (let i = 0; i < iterations; i++) {
			const start = performance.now()
			const cal = generateMultiYearCalendar(currentYear - 1, currentYear + 2)
			const end = performance.now()
			times.push(end - start)
		}

		const avg = times.reduce((a, b) => a + b, 0) / times.length
		const min = Math.min(...times)
		const max = Math.max(...times)
		const size = new Blob([generateMultiYearCalendar(currentYear - 1, currentYear + 2)]).size

		console.log('\n' + '='.repeat(60))
		console.log('MULTI-YEAR SUBSCRIPTION (4 years)')
		console.log('='.repeat(60))
		console.log(`  Iterations:  ${iterations}`)
		console.log(`  Average:     ${avg.toFixed(2)}ms`)
		console.log(`  Min:         ${min.toFixed(2)}ms`)
		console.log(`  Max:         ${max.toFixed(2)}ms`)
		console.log(`  File size:   ${(size / 1024).toFixed(1)}KB`)
		console.log('='.repeat(60) + '\n')
	})

	it('measures cached vs uncached performance', async () => {
		// Import the service to test caching
		const { getYearCalendar, getSubscriptionCalendar } = await import(
			'../../services/calendar.service'
		)

		// First call (uncached)
		const uncachedStart = performance.now()
		getSubscriptionCalendar()
		const uncachedTime = performance.now() - uncachedStart

		// Second call (cached)
		const cachedStart = performance.now()
		getSubscriptionCalendar()
		const cachedTime = performance.now() - cachedStart

		console.log('\n' + '='.repeat(60))
		console.log('CACHE PERFORMANCE')
		console.log('='.repeat(60))
		console.log(`  First call (generate):  ${uncachedTime.toFixed(2)}ms`)
		console.log(`  Second call (cached):   ${cachedTime.toFixed(2)}ms`)
		console.log(`  Speedup:                ${(uncachedTime / cachedTime).toFixed(0)}x faster`)
		console.log('='.repeat(60) + '\n')
	})
})
