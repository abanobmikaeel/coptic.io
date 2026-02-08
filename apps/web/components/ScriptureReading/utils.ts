import { getBookName } from '@/i18n/content-translations'
import {
	getFontClass,
	getLineHeightClass,
	getTextSizeClasses,
	getWeightClass,
	getWordSpacingClass,
} from '@/lib/reading-styles'
import type { Reading } from '@/lib/types'
import type {
	FontFamily,
	FontWeight,
	LineSpacing,
	TextSize,
	WordSpacing,
} from '../DisplaySettings'
import type { BibleTranslation, StyleClasses } from './types'

// Arabic-Indic numerals for RTL display
const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩']

/**
 * Convert Western numerals to Arabic-Indic numerals
 */
export function toArabicNumerals(num: number): string {
	return num
		.toString()
		.split('')
		.map((digit) => arabicNumerals[Number.parseInt(digit, 10)])
		.join('')
}

/**
 * Get verse number in appropriate numeral system
 */
export function getVerseNumber(num: number, isArabic: boolean): string {
	return isArabic ? toArabicNumerals(num) : num.toString()
}

/**
 * Get style classes for a language
 */
export function getStyleClasses(
	lang: BibleTranslation,
	textSize: TextSize,
	lineSpacing: LineSpacing,
	fontFamily: FontFamily,
	weight: FontWeight,
	wordSpacing: WordSpacing,
): StyleClasses {
	const isRtl = lang === 'ar'
	return {
		isRtl,
		sizes: getTextSizeClasses(textSize, isRtl),
		lineHeight: getLineHeightClass(lineSpacing, isRtl),
		fontClass: getFontClass(fontFamily, isRtl),
		weightClass: getWeightClass(weight, isRtl),
		wordSpacingClass: getWordSpacingClass(wordSpacing, isRtl),
	}
}

/**
 * Order languages: English first, then other LTR, then Arabic (RTL) last
 */
export function orderLanguages(availableLangs: BibleTranslation[]): BibleTranslation[] {
	if (availableLangs.includes('en')) {
		return [
			'en',
			...availableLangs.filter((l) => l !== 'en' && l !== 'ar'),
			...availableLangs.filter((l) => l === 'ar'),
		]
	}
	return availableLangs
}

/**
 * Calculate scripture reference string for a language
 */
export function getReferenceForLang(
	lang: BibleTranslation,
	readings: Reading[] | undefined,
): string {
	if (!readings?.length) return ''
	const isRtl = lang === 'ar'
	const separator = isRtl ? '؛ ' : '; '

	return readings
		.map((reading) =>
			reading.chapters
				.map((chapter) => {
					const bookName = getBookName(reading.bookName, lang)
					const firstVerse = chapter.verses[0]?.num
					const lastVerse = chapter.verses[chapter.verses.length - 1]?.num
					const chapterNum = isRtl ? toArabicNumerals(chapter.chapterNum) : chapter.chapterNum
					const firstVerseNum = isRtl ? toArabicNumerals(firstVerse) : firstVerse
					const lastVerseNum = isRtl ? toArabicNumerals(lastVerse) : lastVerse
					return `${bookName} ${chapterNum}:${firstVerseNum}${firstVerse !== lastVerse ? `-${lastVerseNum}` : ''}`
				})
				.join(separator)
		)
		.join(separator)
}
