import { describe, expect, it } from 'vitest'
import { app } from '../../index'

/**
 * Verifies API endpoints localize server-generated strings (Coptic dates,
 * season/fast names, reading-reference book names) via the `lang` param, so
 * clients render API output directly instead of re-implementing translations.
 */

describe('API localization (lang=ar)', () => {
	it('/calendar localizes the Coptic date', async () => {
		const res = await app.request('/api/calendar/2026-06-16?lang=ar')
		expect(res.status).toBe(200)
		const json = (await res.json()) as { monthString: string; dateString: string }
		expect(json.monthString).toBe('بؤونة')
		expect(json.dateString).toBe('بؤونة ٩، ١٧٤٢')
	})

	it('/calendar stays English by default', async () => {
		const res = await app.request('/api/calendar/2026-06-16')
		const json = (await res.json()) as { monthString: string }
		expect(json.monthString).toBe('Paona')
	})

	it('/readings localizes reference book names + Coptic date', async () => {
		const res = await app.request('/api/readings/2026-06-16?lang=ar')
		expect(res.status).toBe(200)
		const json = (await res.json()) as {
			reference?: { LPsalm?: string; LGospel?: string }
			fullDate: { monthString: string }
		}
		expect(json.fullDate.monthString).toBe('بؤونة')
		// Book name translated, chapter/verse kept as Arabic-Indic digits.
		expect(json.reference?.LPsalm).toContain('المزامير')
		expect(json.reference?.LGospel).toContain('متى')
	})

	it('/fasting localizes the fast description', async () => {
		const res = await app.request('/api/fasting/2026-06-16?lang=ar')
		expect(res.status).toBe(200)
		const json = (await res.json()) as { isFasting: boolean; description: string | null }
		if (json.isFasting && json.description) {
			// Should not contain Latin letters once localized.
			expect(/[A-Za-z]/.test(json.description)).toBe(false)
		}
	})
})
