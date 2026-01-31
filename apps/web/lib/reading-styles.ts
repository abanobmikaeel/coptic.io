import type { FontFamily, FontWeight, LineSpacing, ReadingTheme, ReadingWidth, TextSize } from '@/components/DisplaySettings'

// Text sizes - more dramatic jumps, Arabic gets larger sizes for readability
export const getTextSizeClasses = (size: TextSize, isRtl: boolean) => {
	if (isRtl) {
		// Arabic needs larger sizes - Bible.com uses ~24px base
		return {
			sm: { chapter: 'text-lg', verse: 'text-xl', verseNum: 'text-xs' },
			md: { chapter: 'text-xl', verse: 'text-2xl', verseNum: 'text-sm' },
			lg: { chapter: 'text-2xl', verse: 'text-4xl', verseNum: 'text-base' },
		}[size]
	}
	// English - more noticeable jumps (sm: 16px, md: 18px, lg: 24px)
	return {
		sm: { chapter: 'text-xs', verse: 'text-base', verseNum: 'text-[10px]' },
		md: { chapter: 'text-sm', verse: 'text-lg', verseNum: 'text-xs' },
		lg: { chapter: 'text-base', verse: 'text-2xl', verseNum: 'text-sm' },
	}[size]
}

// Line height classes - more generous defaults for comfortable reading
export const getLineHeightClass = (spacing: LineSpacing, isRtl: boolean) => {
	if (isRtl) {
		return {
			compact: 'leading-loose',
			normal: 'leading-[2.25]',
			relaxed: 'leading-[2.75]',
		}[spacing]
	}
	return {
		compact: 'leading-relaxed',
		normal: 'leading-loose',
		relaxed: 'leading-[2.25]',
	}[spacing]
}

// Font family classes
export const getFontClass = (fontFamily: FontFamily, isRtl: boolean) => {
	if (isRtl) return 'font-arabic'
	return fontFamily === 'serif' ? 'font-serif-reading' : ''
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
export const themeClasses = {
	bg: {
		light: 'bg-white',
		sepia: 'bg-[#f5f0e6]',
		dark: 'bg-gray-900',
	} as Record<ReadingTheme, string>,

	bgTranslucent: {
		light: 'bg-white/95',
		sepia: 'bg-[#f5f0e6]/95',
		dark: 'bg-gray-900/95',
	} as Record<ReadingTheme, string>,

	text: {
		light: 'text-gray-800',
		sepia: 'text-[#5c4b37]',
		dark: 'text-gray-200',
	} as Record<ReadingTheme, string>,

	textHeading: {
		light: 'text-gray-900',
		sepia: 'text-[#5c4b37]',
		dark: 'text-gray-100',
	} as Record<ReadingTheme, string>,

	muted: {
		light: 'text-gray-400',
		sepia: 'text-[#a08c72]',
		dark: 'text-gray-500',
	} as Record<ReadingTheme, string>,

	accent: {
		light: 'text-amber-600/70',
		sepia: 'text-amber-700/70',
		dark: 'text-amber-500/70',
	} as Record<ReadingTheme, string>,

	border: {
		light: 'border-gray-200/50',
		sepia: 'border-[#d4c9b8]',
		dark: 'border-gray-800',
	} as Record<ReadingTheme, string>,

	collapsedBg: {
		light: 'bg-gray-100 hover:bg-gray-200',
		sepia: 'bg-[#ebe4d6] hover:bg-[#e0d7c5]',
		dark: 'bg-gray-800/50 hover:bg-gray-800',
	} as Record<ReadingTheme, string>,
}
