import type { ContentLang } from '@/i18n/content-translations'
import type { Reading } from '@/lib/types'
import type {
	FontFamily,
	FontWeight,
	LineSpacing,
	ReadingTheme,
	ReadingWidth,
	TextSize,
	ViewMode,
	WordSpacing,
} from '../DisplaySettings'

export type BibleTranslation = ContentLang

export interface ScriptureReadingProps {
	readingsByLang: Partial<Record<BibleTranslation, Reading[]>>
	labels: { en: string; ar: string; es: string; cop: string }
	languages: BibleTranslation[]
	id: string
	viewMode: ViewMode
	showVerses: boolean
	textSize?: TextSize
	fontFamily?: FontFamily
	lineSpacing?: LineSpacing
	wordSpacing?: WordSpacing
	theme?: ReadingTheme
	width?: ReadingWidth
	weight?: FontWeight
	service?: string
}

export interface StyleClasses {
	isRtl: boolean
	sizes: {
		verse: string
		verseNum: string
		chapter: string
	}
	lineHeight: string
	fontClass: string
	weightClass: string
	wordSpacingClass: string
}

export interface ReadingHeaderProps {
	// Single-lang mode
	title?: string
	reference?: string
	// Multi-lang mode
	orderedLangs?: BibleTranslation[]
	labels?: { en: string; ar: string; es: string; cop: string }
	references?: { en: string; ar: string; es: string; cop: string }
	// Shared
	service?: string
	isOpen: boolean
	theme: ReadingTheme
	isRtl?: boolean
}
