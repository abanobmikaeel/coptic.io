/**
 * Content Language Configuration
 *
 * PHILOSOPHY:
 * - UI Language (locale): Controls navigation, buttons, headers, labels
 *   → Stored in NEXT_LOCALE cookie
 *   → Managed by next-intl
 *
 * - Content Languages: Controls what languages are displayed for readings,
 *   synaxarium entries, prayers, and other liturgical content
 *   → Stored in CONTENT_LANGUAGES cookie
 *   → User can select multiple for multi-language display
 *   → Coptic is always available as the original liturgical language
 *
 * EXAMPLES:
 * - Diaspora Copt: English UI + Arabic & English content
 * - Arabic speaker: Arabic UI + Arabic content only
 * - Scholar: English UI + Coptic, Arabic, & English content
 */

export const contentLanguages = ['cop', 'ar', 'en', 'es'] as const
export type ContentLanguage = (typeof contentLanguages)[number]

export const contentLanguageLabels: Record<ContentLanguage, { en: string; ar: string }> = {
	cop: { en: 'Coptic', ar: 'القبطية' },
	ar: { en: 'Arabic', ar: 'العربية' },
	en: { en: 'English', ar: 'الإنجليزية' },
	es: { en: 'Spanish', ar: 'الإسبانية' },
}

// Default content languages based on UI locale
export const defaultContentLanguages: Record<string, ContentLanguage[]> = {
	en: ['en'], // English UI defaults to English content
	ar: ['ar'], // Arabic UI defaults to Arabic content
}

// Cookie name for storing content language preference
export const CONTENT_LANGUAGES_COOKIE = 'CONTENT_LANGUAGES'

/**
 * Parse content languages from cookie value
 */
export function parseContentLanguages(cookieValue: string | undefined): ContentLanguage[] {
	if (!cookieValue) return []

	const langs = cookieValue
		.split(',')
		.filter((lang): lang is ContentLanguage => contentLanguages.includes(lang as ContentLanguage))

	return langs.length > 0 ? langs : []
}

/**
 * The content languages to render: the saved preference, or the UI locale's
 * defaults when none is saved. Server pages and the client hook both resolve
 * through here so the first render and hydration agree.
 */
export function resolveContentLanguages(
	cookieValue: string | undefined,
	locale: string,
): ContentLanguage[] {
	const parsed = parseContentLanguages(cookieValue)
	return parsed.length > 0
		? parsed
		: (defaultContentLanguages[locale] ?? defaultContentLanguages.en)
}

/**
 * Serialize content languages to cookie value
 */
export function serializeContentLanguages(languages: ContentLanguage[]): string {
	return languages.filter((lang) => contentLanguages.includes(lang)).join(',')
}
