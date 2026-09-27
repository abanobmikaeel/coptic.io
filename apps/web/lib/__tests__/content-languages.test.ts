import { resolveContentLanguages } from '@/i18n/content-languages'
import { describe, expect, it } from 'vitest'

describe('resolveContentLanguages', () => {
	it('uses the saved preference regardless of UI locale', () => {
		expect(resolveContentLanguages('en,ar', 'ar')).toEqual(['en', 'ar'])
	})

	it('defaults to Arabic content for an Arabic UI with no saved preference', () => {
		expect(resolveContentLanguages(undefined, 'ar')).toEqual(['ar'])
	})

	it('defaults to English content for an English UI with no saved preference', () => {
		expect(resolveContentLanguages(undefined, 'en')).toEqual(['en'])
	})

	it('falls back to English for a locale without its own defaults', () => {
		expect(resolveContentLanguages(undefined, 'es')).toEqual(['en'])
	})

	it('ignores a cookie holding only unknown languages', () => {
		expect(resolveContentLanguages('xx,yy', 'ar')).toEqual(['ar'])
	})
})
