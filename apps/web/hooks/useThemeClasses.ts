import type { ReadingTheme } from '@/lib/reading-preferences'
import { themeClasses } from '@/lib/reading-styles'
import { useMemo } from 'react'

export interface ThemeClasses {
	bg: string
	bgTranslucent: string
	text: string
	textHeading: string
	muted: string
	accent: string
	border: string
	collapsedBg: string
	headerBg: string
	cardBg: string
}

export function useThemeClasses(theme: ReadingTheme): ThemeClasses {
	return useMemo(
		() => ({
			bg: themeClasses.bg[theme],
			bgTranslucent: themeClasses.bgTranslucent[theme],
			text: themeClasses.text[theme],
			textHeading: themeClasses.textHeading[theme],
			muted: themeClasses.muted[theme],
			accent: themeClasses.accent[theme],
			border: themeClasses.border[theme],
			collapsedBg: themeClasses.collapsedBg[theme],
			headerBg: themeClasses.headerBg[theme],
			cardBg: themeClasses.cardBg[theme],
		}),
		[theme],
	)
}

// For server components / non-hook contexts
export function getThemeClasses(theme: ReadingTheme): ThemeClasses {
	return {
		bg: themeClasses.bg[theme],
		bgTranslucent: themeClasses.bgTranslucent[theme],
		text: themeClasses.text[theme],
		textHeading: themeClasses.textHeading[theme],
		muted: themeClasses.muted[theme],
		accent: themeClasses.accent[theme],
		border: themeClasses.border[theme],
		collapsedBg: themeClasses.collapsedBg[theme],
		headerBg: themeClasses.headerBg[theme],
		cardBg: themeClasses.cardBg[theme],
	}
}
