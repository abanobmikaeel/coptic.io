import { describe, expect, it } from 'vitest'
import { buildSynaxariumJsonLd, cleanEntryName, describeSynaxarium } from '../synaxarium'

describe('cleanEntryName', () => {
	it('strips a single trailing period', () => {
		expect(cleanEntryName('St. John.')).toBe('St. John')
	})

	it('strips a trailing period with surrounding whitespace', () => {
		expect(cleanEntryName('St. John . ')).toBe('St. John')
	})

	it('preserves internal punctuation', () => {
		expect(cleanEntryName('St. John the Baptist')).toBe('St. John the Baptist')
	})

	it('trims leading and trailing whitespace', () => {
		expect(cleanEntryName('  St. Mary  ')).toBe('St. Mary')
	})

	it('handles whitespace-only input', () => {
		expect(cleanEntryName('   ')).toBe('')
	})
})

describe('describeSynaxarium', () => {
	it('lists the commemorated saints when names are present', () => {
		expect(describeSynaxarium('15 Toba', ['St. John', 'St. Mary'])).toBe(
			'Lives of the saints commemorated on 15 Toba in the Coptic Orthodox Synaxarium: St. John; St. Mary.',
		)
	})

	it('falls back to a generic description when there are no names', () => {
		expect(describeSynaxarium('15 Toba', [])).toBe(
			'Coptic Orthodox Synaxarium commemorations for 15 Toba.',
		)
	})
})

describe('buildSynaxariumJsonLd', () => {
	const jsonLd = buildSynaxariumJsonLd({
		copticDate: '15 Toba',
		names: ['St. John', 'St. Mary'],
		canonicalUrl: 'https://coptic.io/synaxarium/15-Toba',
		baseUrl: 'https://coptic.io',
	})

	it('emits a schema.org @graph with two nodes', () => {
		expect(jsonLd['@context']).toBe('https://schema.org')
		expect(jsonLd['@graph']).toHaveLength(2)
	})

	describe('Article node', () => {
		const article = jsonLd['@graph'][0] as {
			'@type': string
			headline: string
			mainEntityOfPage: string
			about: Array<{ '@type': string; name: string }>
		}

		it('is tagged Article with the date as headline', () => {
			expect(article['@type']).toBe('Article')
			expect(article.headline).toBe('Coptic Synaxarium — 15 Toba')
			expect(article.mainEntityOfPage).toBe('https://coptic.io/synaxarium/15-Toba')
		})

		it('lists each saint as a Thing in about', () => {
			expect(article.about).toEqual([
				{ '@type': 'Thing', name: 'St. John' },
				{ '@type': 'Thing', name: 'St. Mary' },
			])
		})
	})

	describe('BreadcrumbList node', () => {
		const breadcrumb = jsonLd['@graph'][1] as {
			'@type': string
			itemListElement: Array<{ position: number; name: string; item: string }>
		}

		it('has Home → Synaxarium → date order', () => {
			expect(breadcrumb['@type']).toBe('BreadcrumbList')
			expect(breadcrumb.itemListElement).toHaveLength(3)
			expect(breadcrumb.itemListElement.map((i) => i.name)).toEqual([
				'Home',
				'Synaxarium',
				'15 Toba',
			])
			expect(breadcrumb.itemListElement[2].item).toBe('https://coptic.io/synaxarium/15-Toba')
		})
	})

	it('emits an empty about list when there are no names', () => {
		const empty = buildSynaxariumJsonLd({
			copticDate: '15 Toba',
			names: [],
			canonicalUrl: 'https://coptic.io/synaxarium/15-Toba',
			baseUrl: 'https://coptic.io',
		})
		const article = empty['@graph'][0] as { about: unknown[] }
		expect(article.about).toEqual([])
	})
})
