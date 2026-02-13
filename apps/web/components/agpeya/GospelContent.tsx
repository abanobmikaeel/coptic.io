import type { ViewMode } from '@/lib/reading-preferences'
import { VerseDisplay } from './VerseDisplay'
import type { AgpeyaGospel, ThemeStyles } from './types'

interface GospelContentProps {
	gospel: AgpeyaGospel
	textStyles: string
	verseNumClass: string
	themeStyles: ThemeStyles
	isRtl: boolean
	viewMode: ViewMode
}

export function GospelContent({
	gospel,
	textStyles,
	verseNumClass,
	themeStyles,
	isRtl,
	viewMode,
}: GospelContentProps) {
	return (
		<div dir={isRtl ? 'rtl' : 'ltr'}>
			{/* Rubric */}
			{gospel.rubric && (
				<p className={`text-sm italic mb-6 ${themeStyles.muted}`}>{gospel.rubric}</p>
			)}

			{/* Verses */}
			<VerseDisplay
				verses={gospel.verses}
				textStyles={textStyles}
				verseNumClass={verseNumClass}
				themeStyles={themeStyles}
				isRtl={isRtl}
				viewMode={viewMode}
			/>
		</div>
	)
}
