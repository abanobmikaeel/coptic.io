'use client'

import type { MidnightWatch } from '@/components/AgpeyaHourSelector'
import { useReadingSettingsContext } from '@/contexts/ReadingSettingsContext'
import { getTextSizeClasses } from '@/lib/reading-styles'
import { MidnightHour } from './MidnightHour'
import { StandardHour } from './StandardHour'
import { isMidnightData } from './types'
import type { AgpeyaHourData, AgpeyaMidnightData } from './types'

// Re-export types for backwards compatibility
export type {
	AgpeyaGospel,
	AgpeyaHourData,
	AgpeyaLitany,
	AgpeyaMidnightData,
	AgpeyaPrayerSection,
	AgpeyaPsalm,
	AgpeyaVerse,
	AgpeyaWatchData,
	SectionId,
} from './types'
export { isMidnightData } from './types'

interface AgpeyaPrayerProps {
	hour: AgpeyaHourData | AgpeyaMidnightData
	currentWatch?: MidnightWatch
	allCollapsed?: boolean
}

export function AgpeyaPrayer({ hour, currentWatch, allCollapsed = false }: AgpeyaPrayerProps) {
	const { styles, settings } = useReadingSettingsContext()
	const { ltr, rtl, theme } = styles
	const { viewMode } = settings
	const isRtl = settings.translation === 'ar'

	// Get directional styles based on content direction
	const dirStyles = isRtl ? rtl : ltr
	const sizes = getTextSizeClasses(settings.textSize, isRtl)

	const textStyles = `${dirStyles.font} ${dirStyles.weight} ${dirStyles.wordSpacing} ${dirStyles.textSize.verse} ${dirStyles.lineHeight} ${theme.text} ${isRtl ? 'text-right' : ''}`

	const commonProps = {
		textStyles,
		verseNumClass: sizes.verseNum,
		themeStyles: theme,
		isRtl,
		viewMode,
		allCollapsed,
	}

	if (isMidnightData(hour)) {
		return <MidnightHour hour={hour} currentWatch={currentWatch} {...commonProps} />
	}

	return <StandardHour hour={hour} {...commonProps} />
}
