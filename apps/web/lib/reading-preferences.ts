// Types for reading display settings
export type TextSize = 'sm' | 'md' | 'lg'
export type ViewMode = 'verse' | 'continuous'
export type PaginatedMode = 'scroll' | 'paginated'
export type BibleTranslation = 'en' | 'ar'
export type FontFamily = 'sans' | 'serif'
export type LineSpacing = 'compact' | 'normal' | 'relaxed'
export type WordSpacing = 'compact' | 'normal' | 'relaxed'
export type ReadingTheme = 'light' | 'sepia' | 'dark'
export type ThemePreference = ReadingTheme | 'auto'
export type ReadingWidth = 'narrow' | 'normal' | 'wide'
export type FontWeight = 'light' | 'normal' | 'bold'

// Synaxarium-specific view mode (distinct from Bible view mode)
export type SynaxariumViewMode = 'day' | 'upcoming'

const STORAGE_KEY = 'coptic-reading-preferences'

export interface ReadingPreferences {
	size?: TextSize
	view?: ViewMode
	paginatedMode?: PaginatedMode
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
		return stored ? JSON.parse(stored) : {}
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

export function getSystemTheme(): ReadingTheme {
	if (typeof window === 'undefined') return 'light'
	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}
