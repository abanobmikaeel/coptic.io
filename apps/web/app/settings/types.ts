import type {
	FontFamily,
	FontWeight,
	LineSpacing,
	ReadingWidth,
	TextSize,
	ThemePreference,
	ViewMode,
	WordSpacing,
} from '@/lib/reading-preferences'

export interface SettingsFormValues {
	size: TextSize
	view: ViewMode
	font: FontFamily
	spacing: LineSpacing
	wordSpacing: WordSpacing
	theme: ThemePreference
	width: ReadingWidth
	weight: FontWeight
	verses: 'show' | 'hide'
	locale: string
}

export const DEFAULTS: SettingsFormValues = {
	size: 'md',
	view: 'verse',
	font: 'sans',
	spacing: 'normal',
	wordSpacing: 'normal',
	theme: 'auto',
	width: 'normal',
	weight: 'normal',
	verses: 'show',
	locale: 'en',
}
