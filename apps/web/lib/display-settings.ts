import {
	CONTENT_LANGUAGES_COOKIE,
	type ContentLanguage,
	defaultContentLanguages,
	parseContentLanguages,
} from '@/i18n/content-languages'
import type {
	FontFamily,
	FontWeight,
	LineSpacing,
	ReadingTheme,
	ReadingWidth,
	TextSize,
	ViewMode,
	WordSpacing,
} from '@/lib/reading-preferences'
import { READING_THEME_COOKIE } from '@/lib/reading-preferences'

interface CookieStore {
	get(name: string): { value: string } | undefined
}

const validThemes: ReadingTheme[] = ['light', 'sepia', 'dark']

export function resolveTheme(cookieStore: CookieStore): ReadingTheme {
	const val = cookieStore.get(READING_THEME_COOKIE)?.value
	return validThemes.includes(val as ReadingTheme) ? (val as ReadingTheme) : 'light'
}

export function resolveContentLanguages<T extends string>(
	cookieStore: CookieStore,
	supported: T[],
): T[] {
	const cookie = cookieStore.get(CONTENT_LANGUAGES_COOKIE)?.value
	const parsed = parseContentLanguages(cookie)
	const selected: ContentLanguage[] = parsed.length > 0 ? parsed : defaultContentLanguages.en
	const filtered = supported.filter((l) => selected.includes(l as ContentLanguage))
	return filtered.length > 0 ? filtered : supported.slice(0, 1)
}

export interface DisplaySettingsParams {
	view?: string
	verses?: string
	size?: string
	font?: string
	spacing?: string
	wordSpacing?: string
	theme?: string
	width?: string
	weight?: string
}

export interface ParsedDisplaySettings {
	viewMode: ViewMode
	showVerses: boolean
	textSize: TextSize
	fontFamily: FontFamily
	lineSpacing: LineSpacing
	wordSpacing: WordSpacing
	theme: ReadingTheme
	width: ReadingWidth
	fontWeight: FontWeight
}

export function parseDisplaySettings(
	sp: DisplaySettingsParams,
	themeFallback: ReadingTheme,
): ParsedDisplaySettings {
	return {
		viewMode: sp.view === 'verse' ? 'verse' : 'continuous',
		showVerses: sp.verses !== 'hide',
		textSize: (sp.size as TextSize) || 'md',
		fontFamily: (sp.font as FontFamily) || 'sans',
		lineSpacing: (sp.spacing as LineSpacing) || 'normal',
		wordSpacing: (sp.wordSpacing as WordSpacing) || 'normal',
		theme: (sp.theme as ReadingTheme) || themeFallback,
		width: (sp.width as ReadingWidth) || 'normal',
		fontWeight: (sp.weight as FontWeight) || 'normal',
	}
}
