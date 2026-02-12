'use client'

import {
	CONTENT_LANGUAGES_COOKIE,
	type ContentLanguage,
	defaultContentLanguages,
	parseContentLanguages,
	serializeContentLanguages,
} from '@/i18n/content-languages'
import { useLocale } from 'next-intl'
import { useCallback, useEffect, useState } from 'react'

/**
 * Hook for managing content language preferences
 *
 * Content languages are separate from UI language (locale).
 * Users can select multiple languages for multi-language display
 * of readings, synaxarium, and prayers.
 */
export function useContentLanguages() {
	const locale = useLocale()
	const [languages, setLanguagesState] = useState<ContentLanguage[]>([])
	const [isLoaded, setIsLoaded] = useState(false)

	// Load from cookie on mount
	useEffect(() => {
		const cookieValue = document.cookie
			.split('; ')
			.find((row) => row.startsWith(`${CONTENT_LANGUAGES_COOKIE}=`))
			?.split('=')[1]

		const parsed = parseContentLanguages(cookieValue)

		if (parsed.length > 0) {
			setLanguagesState(parsed)
		} else {
			// Use defaults based on UI locale
			setLanguagesState(defaultContentLanguages[locale] || defaultContentLanguages.en)
		}
		setIsLoaded(true)
	}, [locale])

	// Update languages and persist to cookie
	const setLanguages = useCallback((newLanguages: ContentLanguage[]) => {
		setLanguagesState(newLanguages)
		document.cookie = `${CONTENT_LANGUAGES_COOKIE}=${serializeContentLanguages(newLanguages)}; path=/; max-age=31536000`
	}, [])

	// Toggle a specific language
	const toggleLanguage = useCallback(
		(lang: ContentLanguage) => {
			setLanguages(
				languages.includes(lang) ? languages.filter((l) => l !== lang) : [...languages, lang],
			)
		},
		[languages, setLanguages],
	)

	// Check if a language is selected
	const hasLanguage = useCallback((lang: ContentLanguage) => languages.includes(lang), [languages])

	return {
		languages,
		setLanguages,
		toggleLanguage,
		hasLanguage,
		isLoaded,
	}
}
