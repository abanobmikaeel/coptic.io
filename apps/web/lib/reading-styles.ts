import type {
	FontFamily,
	FontWeight,
	LineSpacing,
	ReadingTheme,
	ReadingWidth,
	TextSize,
	WordSpacing,
} from '@/components/DisplaySettings'

// Text sizes - uses CSS variable-based classes for responsive scaling
// Mobile-first: ~30% smaller, scales up on tablet/desktop via --font-scale CSS variable
export const getTextSizeClasses = (size: TextSize, isRtl: boolean) => {
	if (isRtl) {
		// Arabic - uses RTL classes that apply additional --arabic-scale multiplier
		return {
			sm: {
				chapter: 'text-chapter-sm-rtl',
				verse: 'text-verse-sm-rtl',
				verseNum: 'text-versenum-sm-rtl',
			},
			md: {
				chapter: 'text-chapter-md-rtl',
				verse: 'text-verse-md-rtl',
				verseNum: 'text-versenum-md-rtl',
			},
			lg: {
				chapter: 'text-chapter-lg-rtl',
				verse: 'text-verse-lg-rtl',
				verseNum: 'text-versenum-lg-rtl',
			},
		}[size]
	}
	// English (LTR) - scalable via CSS variables
	return {
		sm: { chapter: 'text-chapter-sm', verse: 'text-verse-sm', verseNum: 'text-versenum-sm' },
		md: { chapter: 'text-chapter-md', verse: 'text-verse-md', verseNum: 'text-versenum-md' },
		lg: { chapter: 'text-chapter-lg', verse: 'text-verse-lg', verseNum: 'text-versenum-lg' },
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

// Width classes - mobile uses nearly full width, constraints apply on larger screens
export const getWidthClass = (width: ReadingWidth) => {
	return {
		narrow: 'max-w-full sm:max-w-lg',
		normal: 'max-w-full sm:max-w-2xl',
		wide: 'max-w-full sm:max-w-4xl',
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
