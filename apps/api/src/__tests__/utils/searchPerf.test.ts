import { beforeAll, describe, it } from 'vitest'
import { SimpleSearchService } from '../../services/search/simple-search.service'

describe('Search Performance', () => {
	let searchService: SimpleSearchService

	beforeAll(async () => {
		searchService = new SimpleSearchService()
		await searchService.initialize()
	})

	it('measures Bible full-text search performance', async () => {
		const queries = ['love', 'faith', 'grace', 'salvation', 'righteousness']
		const iterations = 5
		const times: number[] = []

		for (let i = 0; i < iterations; i++) {
			for (const query of queries) {
				const start = performance.now()
				await searchService.searchBible(query, 10)
				times.push(performance.now() - start)
			}
		}

		const avg = times.reduce((a, b) => a + b, 0) / times.length
		const min = Math.min(...times)
		const max = Math.max(...times)

		console.log(`\n${'='.repeat(60)}`)
		console.log('BIBLE FULL-TEXT SEARCH')
		console.log('='.repeat(60))
		console.log(`  Queries:     ${queries.join(', ')}`)
		console.log(`  Iterations:  ${iterations} per query`)
		console.log(`  Average:     ${avg.toFixed(2)}ms`)
		console.log(`  Min:         ${min.toFixed(2)}ms`)
		console.log(`  Max:         ${max.toFixed(2)}ms`)
		console.log(`${'='.repeat(60)}\n`)
	})

	it('measures Bible reference lookup performance', async () => {
		const refs = ['John 3:16', 'Genesis 1:1', 'Psalm 23', 'Romans 8:28', 'Matthew 5:1']
		const iterations = 20
		const times: number[] = []

		for (let i = 0; i < iterations; i++) {
			for (const ref of refs) {
				const start = performance.now()
				await searchService.searchBible(ref, 5)
				times.push(performance.now() - start)
			}
		}

		const avg = times.reduce((a, b) => a + b, 0) / times.length
		const min = Math.min(...times)
		const max = Math.max(...times)

		console.log(`\n${'='.repeat(60)}`)
		console.log('BIBLE REFERENCE LOOKUP (indexed)')
		console.log('='.repeat(60))
		console.log(`  References:  ${refs.join(', ')}`)
		console.log(`  Iterations:  ${iterations} per ref`)
		console.log(`  Average:     ${avg.toFixed(2)}ms`)
		console.log(`  Min:         ${min.toFixed(2)}ms`)
		console.log(`  Max:         ${max.toFixed(2)}ms`)
		console.log(`${'='.repeat(60)}\n`)
	})

	it('measures synaxarium search performance', async () => {
		const queries = ['mary', 'peter', 'paul', 'mark', 'anthony']
		const iterations = 10
		const times: number[] = []

		for (let i = 0; i < iterations; i++) {
			for (const query of queries) {
				const start = performance.now()
				await searchService.searchSynaxarium(query, 10)
				times.push(performance.now() - start)
			}
		}

		const avg = times.reduce((a, b) => a + b, 0) / times.length

		console.log(`\n${'='.repeat(60)}`)
		console.log('SYNAXARIUM SEARCH')
		console.log('='.repeat(60))
		console.log(`  Queries:     ${queries.join(', ')}`)
		console.log(`  Iterations:  ${iterations} per query`)
		console.log(`  Average:     ${avg.toFixed(2)}ms`)
		console.log(`${'='.repeat(60)}\n`)
	})
})
