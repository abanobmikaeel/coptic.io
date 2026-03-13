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

export interface ReadingPreferences {
	size?: TextSize
	view?: ViewMode
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

export function getSystemTheme(): ReadingTheme {
	if (typeof window === 'undefined') return 'light'
	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}
