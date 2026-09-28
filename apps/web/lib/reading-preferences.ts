// Types for reading display settings
export type TextSize = 'sm' | 'md' | 'lg'
export type ViewMode = 'verse' | 'continuous'
export type BibleTranslation = 'en' | 'ar'
export type FontFamily = 'sans' | 'serif'
export type LineSpacing = 'compact' | 'normal' | 'relaxed'
export type WordSpacing = 'compact' | 'normal' | 'relaxed'
export type ReadingTheme = 'light' | 'sepia' | 'dark'
export type ThemePreference = ReadingTheme | 'auto'
export type ReadingWidth = 'narrow' | 'normal' | 'wide'
export type FontWeight = 'light' | 'normal' | 'bold'

const STORAGE_KEY = 'coptic-reading-preferences'

/**
 * The view mode a URL `view` param selects. Verse-by-verse is the default, so an absent or
 * unknown value means `verse`; the settings panel removes the param when you choose it.
 */
export function parseViewMode(value: string | null | undefined): ViewMode {
	return value === 'continuous' ? 'continuous' : 'verse'
}

// Migration map for old invalid values that may be stored in localStorage
const MIGRATIONS: Record<string, Record<string, string>> = {
	spacing: { tight: 'compact' },
	wordSpacing: { wide: 'relaxed' },
	weight: { medium: 'normal' },
}

function migratePreferences(prefs: Record<string, unknown>): Record<string, unknown> {
	const migrated = { ...prefs }
	let changed = false
	for (const [key, mapping] of Object.entries(MIGRATIONS)) {
		const value = migrated[key]
		if (typeof value === 'string' && value in mapping) {
			migrated[key] = mapping[value]
			changed = true
		}
	}
	return changed ? migrated : prefs
}

export type ReaderMode = 'present' | 'scroll'

export interface ReadingPreferences {
	size?: TextSize
	view?: ViewMode
	/** Presentation (paginated) vs. continuous "Reading" scroll. */
	mode?: ReaderMode
	lang?: BibleTranslation
	font?: FontFamily
	spacing?: LineSpacing
	wordSpacing?: WordSpacing
	theme?: ThemePreference
	width?: ReadingWidth
	weight?: FontWeight
	verses?: 'hide' | null
}

export function loadPreferences(): ReadingPreferences {
	if (typeof window === 'undefined') return {}
	try {
		const stored = localStorage.getItem(STORAGE_KEY)
		if (!stored) return {}
		const parsed = JSON.parse(stored)
		const migrated = migratePreferences(parsed)
		// If migration changed anything, save the migrated values
		if (migrated !== parsed) {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated))
		}
		return migrated as ReadingPreferences
	} catch {
		return {}
	}
}

export function savePreferences(prefs: ReadingPreferences) {
	if (typeof window === 'undefined') return
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
	} catch {
		// Ignore storage errors
	}
}

/**
 * Adds stored preferences to display params the URL leaves unset. Params already in the URL win,
 * so a shared or bookmarked link still shows what it asks for. Defaults are never written, since
 * an absent param already means the default.
 */
export function withStoredPreferences(
	params: URLSearchParams,
	prefs: ReadingPreferences,
	theme: ReadingTheme | undefined,
): URLSearchParams {
	const next = new URLSearchParams(params)
	const fill = (key: string, value: string | null | undefined, fallback: string) => {
		if (value && value !== fallback && !next.has(key)) next.set(key, value)
	}
	fill('size', prefs.size, 'md')
	fill('view', prefs.view, 'verse')
	fill('lang', prefs.lang, 'en')
	fill('font', prefs.font, 'sans')
	fill('spacing', prefs.spacing, 'normal')
	fill('wordSpacing', prefs.wordSpacing, 'normal')
	fill('theme', theme, 'light')
	fill('width', prefs.width, 'normal')
	fill('weight', prefs.weight, 'normal')
	fill('verses', prefs.verses, 'show')
	return next
}

export function getSystemTheme(): ReadingTheme {
	if (typeof window === 'undefined') return 'light'
	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}
