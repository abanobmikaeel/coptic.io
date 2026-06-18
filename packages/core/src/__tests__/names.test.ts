import { describe, expect, it } from 'vitest'
import { getCopticMonthName, getLiturgicalName, localizeCopticDate, toArabicDigits } from '../i18n'

describe('Localized names', () => {
	it('returns Coptic month names per language', () => {
		expect(getCopticMonthName(10, 'en')).toBe('Paona')
		expect(getCopticMonthName(10, 'ar')).toBe('بؤونة')
		expect(getCopticMonthName(6, 'ar')).toBe('أمشير')
		// Spanish has no distinct Coptic forms — falls back to the transliteration.
		expect(getCopticMonthName(10, 'es')).toBe('Paona')
	})

	it('localizes a Coptic date with Arabic month + digits', () => {
		const date = { dateString: 'Paona 9, 1742', day: 9, month: 10, year: 1742, monthString: 'Paona' }
		expect(localizeCopticDate(date, 'en').dateString).toBe('Paona 9, 1742')
		expect(localizeCopticDate(date, 'ar').dateString).toBe('بؤونة ٩، ١٧٤٢')
	})

	it('localizes season/fast names, falling back to the English name', () => {
		expect(getLiturgicalName("Apostles' Fast", 'ar')).toBe('صوم الرسل')
		expect(getLiturgicalName('Great Lent', 'es')).toBe('Gran Cuaresma')
		expect(getLiturgicalName('Some Unknown Feast', 'ar')).toBe('Some Unknown Feast')
		expect(getLiturgicalName("Apostles' Fast", 'en')).toBe("Apostles' Fast")
	})

	it('converts digits to Arabic-Indic', () => {
		expect(toArabicDigits('99:6-7')).toBe('٩٩:٦-٧')
	})
})
