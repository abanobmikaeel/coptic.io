import { describe, expect, it } from 'vitest'
import { getBibleBookName, localizeReference } from '../bookNames'

describe('Bible book name localization', () => {
	it('translates book names', () => {
		expect(getBibleBookName('Psalms', 'ar')).toBe('المزامير')
		expect(getBibleBookName('Matthew', 'ar')).toBe('متى')
		expect(getBibleBookName('Psalms', 'en')).toBe('Psalms')
		expect(getBibleBookName('Nonexistent', 'ar')).toBe('Nonexistent')
	})

	it('localizes a reference, keeping chapter/verse numbers (Arabic-Indic)', () => {
		expect(localizeReference('Psalms 99:6-7', 'en')).toBe('Psalms 99:6-7')
		expect(localizeReference('Psalms 99:6-7', 'ar')).toBe('المزامير ٩٩:٦-٧')
		expect(localizeReference('Matthew 23:13-36', 'ar')).toBe('متى ٢٣:١٣-٣٦')
	})

	it('handles multi-part references', () => {
		expect(localizeReference('Psalms 65:11;Psalms 81:1', 'ar')).toBe('المزامير ٦٥:١١؛ المزامير ٨١:١')
	})

	it('returns empty string for missing input', () => {
		expect(localizeReference(undefined, 'ar')).toBe('')
	})
})
