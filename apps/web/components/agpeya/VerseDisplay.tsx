import type { ViewMode } from '@/lib/reading-preferences'
import type { AgpeyaVerse, ThemeStyles } from './types'

interface VerseDisplayProps {
	verses: AgpeyaVerse[]
	textStyles: string
	verseNumClass: string
	themeStyles: ThemeStyles
	isRtl: boolean
	viewMode: ViewMode
}

export function VerseDisplay({
	verses,
	textStyles,
	verseNumClass,
	themeStyles,
	isRtl,
	viewMode,
}: VerseDisplayProps) {
	if (viewMode === 'continuous') {
		return (
			<p className={`${textStyles} ${isRtl ? 'text-right' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
				{verses.map((verse, idx) => (
					<span key={verse.num}>
						<sup
							className={`${themeStyles.accent} ${verseNumClass} font-normal ${isRtl ? 'ml-1' : 'mr-1'}`}
						>
							{verse.num}
						</sup>
						{verse.text}
						{idx < verses.length - 1 && ' '}
					</span>
				))}
			</p>
		)
	}

	return (
		<div
			className={`space-y-4 ${textStyles} ${isRtl ? 'text-right' : ''}`}
			dir={isRtl ? 'rtl' : 'ltr'}
		>
			{verses.map((verse) => (
				<p key={verse.num}>
					<span
						className={`${themeStyles.accent} ${verseNumClass} font-normal tabular-nums ${isRtl ? 'ml-2' : 'mr-2'}`}
					>
						{verse.num}
					</span>
					{verse.text}
				</p>
			))}
		</div>
	)
}
