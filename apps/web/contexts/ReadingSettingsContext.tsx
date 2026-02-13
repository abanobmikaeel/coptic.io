'use client'

import type { ReadingSettings, ReadingSettingsActions } from '@/hooks/useReadingSettings'
import { useReadingSettings } from '@/hooks/useReadingSettings'
import {
	getFontClass,
	getLineHeightClass,
	getTextSizeClasses,
	getWeightClass,
	getWidthClass,
	getWordSpacingClass,
	themeClasses,
} from '@/lib/reading-styles'
import { type ReactNode, createContext, useContext, useMemo } from 'react'

// Pre-computed style classes for a specific language direction
export interface DirectionalStyles {
	font: string
	weight: string
	wordSpacing: string
	lineHeight: string
	textSize: {
		chapter: string
		verse: string
		verseNum: string
	}
}

// Theme-related classes
export interface ThemeStyles {
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

// Combined style classes
export interface ReadingStyleClasses {
	ltr: DirectionalStyles
	rtl: DirectionalStyles
	theme: ThemeStyles
	width: string
}

// Bundled typography settings for components that still need raw values
export interface TypographySettings {
	textSize: ReadingSettings['textSize']
	fontFamily: ReadingSettings['fontFamily']
	lineSpacing: ReadingSettings['lineSpacing']
	wordSpacing: ReadingSettings['wordSpacing']
	weight: ReadingSettings['weight']
}

export interface ReadingSettingsContextValue {
	settings: ReadingSettings
	actions: ReadingSettingsActions
	mounted: boolean
	styles: ReadingStyleClasses
	typography: TypographySettings
}

const ReadingSettingsContext = createContext<ReadingSettingsContextValue | null>(null)

export function ReadingSettingsProvider({ children }: { children: ReactNode }) {
	const { settings, actions, mounted } = useReadingSettings()

	// Pre-compute all style classes
	const styles = useMemo<ReadingStyleClasses>(() => {
		const { textSize, fontFamily, lineSpacing, wordSpacing, weight, theme, width } = settings

		return {
			ltr: {
				font: getFontClass(fontFamily, false),
				weight: getWeightClass(weight, false),
				wordSpacing: getWordSpacingClass(wordSpacing, false),
				lineHeight: getLineHeightClass(lineSpacing, false),
				textSize: getTextSizeClasses(textSize, false),
			},
			rtl: {
				font: getFontClass(fontFamily, true),
				weight: getWeightClass(weight, true),
				wordSpacing: getWordSpacingClass(wordSpacing, true),
				lineHeight: getLineHeightClass(lineSpacing, true),
				textSize: getTextSizeClasses(textSize, true),
			},
			theme: {
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
			},
			width: getWidthClass(width),
		}
	}, [settings])

	// Bundle typography settings for components that need raw values
	const typography = useMemo<TypographySettings>(
		() => ({
			textSize: settings.textSize,
			fontFamily: settings.fontFamily,
			lineSpacing: settings.lineSpacing,
			wordSpacing: settings.wordSpacing,
			weight: settings.weight,
		}),
		[
			settings.textSize,
			settings.fontFamily,
			settings.lineSpacing,
			settings.wordSpacing,
			settings.weight,
		],
	)

	const value = useMemo<ReadingSettingsContextValue>(
		() => ({
			settings,
			actions,
			mounted,
			styles,
			typography,
		}),
		[settings, actions, mounted, styles, typography],
	)

	return <ReadingSettingsContext.Provider value={value}>{children}</ReadingSettingsContext.Provider>
}

/**
 * Hook to access reading settings from context.
 * Must be used within a ReadingSettingsProvider.
 */
export function useReadingSettingsContext(): ReadingSettingsContextValue {
	const context = useContext(ReadingSettingsContext)
	if (!context) {
		throw new Error('useReadingSettingsContext must be used within a ReadingSettingsProvider')
	}
	return context
}

/**
 * Hook to access only the pre-computed style classes.
 * Useful for components that only need styles, not settings.
 */
export function useReadingStyles(): ReadingStyleClasses & { mounted: boolean } {
	const { styles, mounted } = useReadingSettingsContext()
	return { ...styles, mounted }
}

/**
 * Hook to access only typography settings.
 * Useful for components that need to pass raw values to children.
 */
export function useTypography(): TypographySettings {
	const { typography } = useReadingSettingsContext()
	return typography
}
