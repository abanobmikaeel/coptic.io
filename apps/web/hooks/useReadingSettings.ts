'use client'

import {
	type BibleTranslation,
	type FontFamily,
	type FontWeight,
	type LineSpacing,
	type ReadingPreferences,
	type ReadingTheme,
	type ReadingWidth,
	type TextSize,
	type ThemePreference,
	type ViewMode,
	type WordSpacing,
	getSystemTheme,
	loadPreferences,
	savePreferences,
} from '@/lib/reading-preferences'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

export interface ReadingSettings {
	showVerses: boolean
	textSize: TextSize
	viewMode: ViewMode
	translation: BibleTranslation
	fontFamily: FontFamily
	lineSpacing: LineSpacing
	wordSpacing: WordSpacing
	theme: ReadingTheme
	width: ReadingWidth
	weight: FontWeight
	isAutoTheme: boolean
}

export interface ReadingSettingsActions {
	setShowVerses: (show: boolean) => void
	setTextSize: (size: TextSize) => void
	setViewMode: (mode: ViewMode) => void
	setTranslation: (lang: BibleTranslation) => void
	setFontFamily: (font: FontFamily) => void
	setLineSpacing: (spacing: LineSpacing) => void
	setWordSpacing: (spacing: WordSpacing) => void
	setTheme: (theme: ThemePreference) => void
	setWidth: (width: ReadingWidth) => void
	setWeight: (weight: FontWeight) => void
}

function settingsFromParams(params: URLSearchParams, isAutoTheme: boolean): ReadingSettings {
	return {
		showVerses: params.get('verses') !== 'hide',
		textSize: (params.get('size') as TextSize) || 'md',
		viewMode: (params.get('view') as ViewMode) || 'verse',
		translation: (params.get('lang') as BibleTranslation) || 'en',
		fontFamily: (params.get('font') as FontFamily) || 'sans',
		lineSpacing: (params.get('spacing') as LineSpacing) || 'normal',
		wordSpacing: (params.get('wordSpacing') as WordSpacing) || 'normal',
		theme: (params.get('theme') as ReadingTheme) || 'light',
		width: (params.get('width') as ReadingWidth) || 'normal',
		weight: (params.get('weight') as FontWeight) || 'normal',
		isAutoTheme,
	}
}

export function useReadingSettings(): {
	settings: ReadingSettings
	actions: ReadingSettingsActions
	mounted: boolean
} {
	const router = useRouter()
	const pathname = usePathname()
	const searchParams = useSearchParams()
	const [mounted, setMounted] = useState(false)
	const [isAutoTheme, setIsAutoTheme] = useState(false)
	// Local override for settings loaded from preferences on mount.
	// history.replaceState doesn't trigger useSearchParams updates, so we
	// store the resolved settings in state to drive the first render.
	const [localSettings, setLocalSettings] = useState<ReadingSettings | null>(null)

	// Initialize preferences on mount
	// biome-ignore lint/correctness/useExhaustiveDependencies: intentionally run only once on mount
	useEffect(() => {
		setMounted(true)
		const prefs = loadPreferences()
		const systemTheme = getSystemTheme()

		const isAuto = !prefs.theme || prefs.theme === 'auto'
		setIsAutoTheme(isAuto)

		// If no display settings in URL, apply stored preferences while preserving other params (like date)
		const currentParams = searchParams.toString()
		if (currentParams === '' || !searchParams.has('size')) {
			const params = new URLSearchParams(searchParams.toString())
			if (prefs.size && prefs.size !== 'md') params.set('size', prefs.size)
			if (prefs.view && prefs.view !== 'verse') params.set('view', prefs.view)
			if (prefs.lang && prefs.lang !== 'en') params.set('lang', prefs.lang)
			if (prefs.font && prefs.font !== 'sans') params.set('font', prefs.font)
			if (prefs.spacing && prefs.spacing !== 'normal') params.set('spacing', prefs.spacing)
			if (prefs.wordSpacing && prefs.wordSpacing !== 'normal')
				params.set('wordSpacing', prefs.wordSpacing)
			const effectiveTheme = isAuto ? systemTheme : prefs.theme
			if (effectiveTheme && effectiveTheme !== 'light') params.set('theme', effectiveTheme)
			if (prefs.width && prefs.width !== 'normal') params.set('width', prefs.width)
			if (prefs.weight && prefs.weight !== 'normal') params.set('weight', prefs.weight)
			if (prefs.verses === 'hide') params.set('verses', 'hide')

			const queryString = params.toString()
			if (queryString) {
				window.history.replaceState(null, '', `${pathname}?${queryString}`)
			}
			// Store resolved settings in state so the component re-renders
			setLocalSettings(settingsFromParams(params, isAuto))
		}

		// Listen for system theme changes
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
		const handleSystemThemeChange = (e: MediaQueryListEvent) => {
			const storedPrefs = loadPreferences()
			const isAutoEnabled = !storedPrefs.theme || storedPrefs.theme === 'auto'
			if (isAutoEnabled) {
				const newSystemTheme = e.matches ? 'dark' : 'light'
				const params = new URLSearchParams(window.location.search)
				if (newSystemTheme === 'light') {
					params.delete('theme')
				} else {
					params.set('theme', newSystemTheme)
				}
				const queryString = params.toString()
				window.history.replaceState(null, '', queryString ? `${pathname}?${queryString}` : pathname)
				setLocalSettings(settingsFromParams(params, true))
			}
		}
		mediaQuery.addEventListener('change', handleSystemThemeChange)
		return () => mediaQuery.removeEventListener('change', handleSystemThemeChange)
	}, [])

	// Use local state (from loaded prefs) if available, otherwise read from URL
	const settings: ReadingSettings = localSettings ?? settingsFromParams(searchParams, isAutoTheme)

	// Generic param updater
	const updateParam = useCallback(
		(key: string, value: string | null) => {
			const params = new URLSearchParams(searchParams.toString())
			if (value === null) {
				params.delete(key)
			} else {
				params.set(key, value)
			}
			const queryString = params.toString()
			// Clear local override so searchParams (updated by router.push) takes over
			setLocalSettings(null)
			router.push(queryString ? `${pathname}?${queryString}` : pathname)

			const prefs = loadPreferences()
			if (value === null) {
				delete prefs[key as keyof ReadingPreferences]
			} else {
				;(prefs as Record<string, string>)[key] = value
			}
			savePreferences(prefs)
		},
		[router, pathname, searchParams],
	)

	// Actions
	const actions: ReadingSettingsActions = {
		setShowVerses: (show) => updateParam('verses', show ? null : 'hide'),
		setTextSize: (size) => updateParam('size', size === 'md' ? null : size),
		setViewMode: (mode) => updateParam('view', mode === 'verse' ? null : mode),
		setTranslation: (lang) => updateParam('lang', lang === 'en' ? null : lang),
		setFontFamily: (font) => updateParam('font', font === 'sans' ? null : font),
		setLineSpacing: (spacing) => updateParam('spacing', spacing === 'normal' ? null : spacing),
		setWordSpacing: (spacing) => updateParam('wordSpacing', spacing === 'normal' ? null : spacing),
		setWidth: (w) => updateParam('width', w === 'normal' ? null : w),
		setWeight: (w) => updateParam('weight', w === 'normal' ? null : w),
		setTheme: (t) => {
			const params = new URLSearchParams(searchParams.toString())

			if (t === 'auto') {
				setIsAutoTheme(true)
				const systemTheme = getSystemTheme()
				if (systemTheme === 'light') {
					params.delete('theme')
				} else {
					params.set('theme', systemTheme)
				}
			} else {
				setIsAutoTheme(false)
				if (t === 'light') {
					params.delete('theme')
				} else {
					params.set('theme', t)
				}
			}

			const queryString = params.toString()
			setLocalSettings(null)
			router.push(queryString ? `${pathname}?${queryString}` : pathname)

			const prefs = loadPreferences()
			prefs.theme = t
			savePreferences(prefs)
		},
	}

	return { settings, actions, mounted }
}
