import type {
	FontFamily,
	FontWeight,
	LineSpacing,
	ReadingTheme,
	ReadingWidth,
	TextSize,
	WordSpacing,
} from '@/components/DisplaySettings'

// Text sizes - generous for comfortable reading, especially on podium/lectern use
export const getTextSizeClasses = (size: TextSize, isRtl: boolean) => {
	if (isRtl) {
		// Arabic needs larger sizes for readability
		return {
			sm: { chapter: 'text-xl', verse: 'text-2xl', verseNum: 'text-sm' },
			md: { chapter: 'text-2xl', verse: 'text-3xl', verseNum: 'text-base' },
			lg: { chapter: 'text-3xl', verse: 'text-4xl', verseNum: 'text-lg' },
		}[size]
	}
	// English - comfortable reading sizes (sm: 18px, md: 24px, lg: 30px)
	return {
		sm: { chapter: 'text-sm', verse: 'text-lg', verseNum: 'text-xs' },
		md: { chapter: 'text-base', verse: 'text-2xl', verseNum: 'text-sm' },
		lg: { chapter: 'text-lg', verse: 'text-3xl', verseNum: 'text-base' },
	}[size]
}

// Line height classes - generous for comfortable reading and podium use
export const getLineHeightClass = (spacing: LineSpacing, isRtl: boolean) => {
	if (isRtl) {
		return {
			compact: 'leading-[2]',
			normal: 'leading-[2.5]',
			relaxed: 'leading-[3]',
		}[spacing]
	}
	return {
		compact: 'leading-loose',
		normal: 'leading-[2]',
		relaxed: 'leading-[2.5]',
	}[spacing]
}

// Font family classes
export const getFontClass = (fontFamily: FontFamily, isRtl: boolean) => {
	if (isRtl) return 'font-arabic'
	return fontFamily === 'serif' ? 'font-serif-reading' : ''
}

// Word spacing classes (English only)
export const getWordSpacingClass = (wordSpacing: WordSpacing, isRtl: boolean) => {
	if (isRtl) return '' // Arabic has its own spacing
	const classes: Record<WordSpacing, string> = {
		compact: 'word-spacing-compact',
		normal: 'word-spacing-normal',
		relaxed: 'word-spacing-relaxed',
	}
	return classes[wordSpacing]
}

// Font weight classes - Arabic uses different weight values for Amiri font
export const getWeightClass = (weight: FontWeight, isRtl: boolean) => {
	if (isRtl) {
		// Amiri font supports 400 (normal) and 700 (bold)
		return {
			light: 'font-normal', // Amiri doesn't have light, use normal
			normal: 'font-normal',
			bold: 'font-bold', // Use actual bold for Arabic
		}[weight]
	}
	return {
		light: 'font-light',
		normal: 'font-normal',
		bold: 'font-medium',
	}[weight]
}

// Width classes
export const getWidthClass = (width: ReadingWidth) => {
	return {
		narrow: 'max-w-lg',
		normal: 'max-w-2xl',
		wide: 'max-w-4xl',
	}[width]
}

// Theme classes
// Note: 'light' theme uses dark: variants to respect system dark mode preference
export const themeClasses = {
	bg: {
		light: 'bg-gray-50 dark:bg-gray-900',
		sepia: 'bg-[#f5f0e6]',
		dark: 'bg-gray-900',
	} as Record<ReadingTheme, string>,

	bgTranslucent: {
		light: 'bg-gray-50/95 dark:bg-gray-900/95',
		sepia: 'bg-[#f5f0e6]/95',
		dark: 'bg-gray-900/95',
	} as Record<ReadingTheme, string>,

	text: {
		light: 'text-gray-800 dark:text-gray-200',
		sepia: 'text-[#5c4b37]',
		dark: 'text-gray-200',
	} as Record<ReadingTheme, string>,

	textHeading: {
		light: 'text-gray-900 dark:text-gray-100',
		sepia: 'text-[#5c4b37]',
		dark: 'text-gray-100',
	} as Record<ReadingTheme, string>,

	// Muted text colors - WCAG 2.1 AA compliant (4.5:1 contrast ratio)
	muted: {
		light: 'text-gray-500 dark:text-gray-400',
		sepia: 'text-[#6b5a45]', // Darker brown for 4.5:1+ contrast on #f5f0e6
		dark: 'text-gray-400', // Lighter gray for 4.5:1+ contrast on gray-900
	} as Record<ReadingTheme, string>,

	// Accent colors - WCAG 2.1 AA compliant (removed transparency for better contrast)
	accent: {
		light: 'text-amber-600 dark:text-amber-400',
		sepia: 'text-amber-800', // Darker amber for sepia background
		dark: 'text-amber-400', // Lighter amber for dark background
	} as Record<ReadingTheme, string>,

	border: {
		light: 'border-gray-200/50 dark:border-gray-800',
		sepia: 'border-[#d4c9b8]',
		dark: 'border-gray-800',
	} as Record<ReadingTheme, string>,

	collapsedBg: {
		light: 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800/50 dark:hover:bg-gray-800',
		sepia: 'bg-[#ebe4d6] hover:bg-[#e0d7c5]',
		dark: 'bg-gray-800/50 hover:bg-gray-800',
	} as Record<ReadingTheme, string>,

	// Subtle background for section headers to indicate interactivity
	headerBg: {
		light: 'bg-gray-50/50 hover:bg-gray-100/70 dark:bg-gray-800/30 dark:hover:bg-gray-800/50',
		sepia: 'bg-[#f0ebe1]/50 hover:bg-[#ebe4d6]/70',
		dark: 'bg-gray-800/30 hover:bg-gray-800/50',
	} as Record<ReadingTheme, string>,

	// Card background - always visible
	cardBg: {
		light: 'bg-gray-50/70 hover:bg-gray-100/80 dark:bg-gray-800/40 dark:hover:bg-gray-800/60',
		sepia: 'bg-[#ebe4d6]/50 hover:bg-[#e5dccb]/70',
		dark: 'bg-gray-800/40 hover:bg-gray-800/60',
	} as Record<ReadingTheme, string>,
}
