import { beforeAll, describe, expect, it } from 'vitest'
import { SimpleSearchService } from '../../services/search/simple-search.service'

describe('Search service', () => {
	let service: SimpleSearchService

	beforeAll(async () => {
		service = new SimpleSearchService()
		await service.initialize()
	})

	it('resolves "Psalm 1" to a Bible reference result', async () => {
		const results = await service.searchBible('Psalm 1', 5)
		expect(results.length).toBeGreaterThan(0)
		expect(results[0]?.type).toBe('reference')
		expect(results[0]?.book).toBe('Psalms')
		expect(results[0]?.chapter).toBe(1)
	})

	it('resolves numbered books like "1 John 3:16"', async () => {
		const results = await service.searchBible('1 John 3:16', 5)
		expect(results.length).toBeGreaterThan(0)
		expect(results[0]?.book).toBe('1 John')
		expect(results[0]?.chapter).toBe(3)
		expect(results[0]?.verse).toBe(16)
	})

	it('searches the full Bible, including the New Testament', async () => {
		const results = await service.searchBible('Jesus', 5)
		expect(results.length).toBeGreaterThan(0)
		expect(results.some((r) => r.book === 'Matthew' || r.book === 'John')).toBe(true)
	})
})
