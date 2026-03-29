import { themeClasses } from '@/lib/reading-styles'
import type { ReadingTheme } from '../DisplaySettings'
import type { StyleClasses } from './types'
import { getVerseNumber } from './utils'

interface ContinuousParagraphProps {
	verses: { num: number; text: string }[]
	styleClasses: StyleClasses
	showVerses: boolean
	theme: ReadingTheme
}

export function ContinuousParagraph({ verses, styleClasses, showVerses, theme }: ContinuousParagraphProps) {
	const { isRtl, sizes, lineHeight, fontClass, weightClass, wordSpacingClass } = styleClasses
	return (
		<p
			className={`${fontClass} ${weightClass} ${wordSpacingClass} ${sizes.verse} ${lineHeight} ${themeClasses.text[theme]} ${isRtl ? 'text-right' : !showVerses ? 'first-letter-large' : ''}`}
			dir={isRtl ? 'rtl' : 'ltr'}
		>
			{verses.map((verse, vidx) => (
				<span key={verse.num}>
					{showVerses && (
						<sup className={`${sizes.verseNum} font-normal ${themeClasses.accent[theme]} ${isRtl ? 'ml-1' : 'mr-1'}`}>
							{getVerseNumber(verse.num, isRtl)}
						</sup>
					)}
					<span>{verse.text}</span>
					{vidx < verses.length - 1 && ' '}
				</span>
			))}
		</p>
	)
}

interface VerseParagraphProps {
	verse: { num: number; text: string }
	styleClasses: StyleClasses
	showVerses: boolean
	theme: ReadingTheme
	isFirst?: boolean
}

export function VerseParagraph({ verse, styleClasses, showVerses, theme, isFirst = false }: VerseParagraphProps) {
	const { isRtl, sizes, lineHeight, fontClass, weightClass, wordSpacingClass } = styleClasses
	return (
		<p
			className={`${fontClass} ${weightClass} ${wordSpacingClass} ${sizes.verse} ${lineHeight} ${themeClasses.text[theme]} ${isRtl ? 'text-right' : ''} ${isFirst && !isRtl && !showVerses ? 'first-letter-large' : ''}`}
			dir={isRtl ? 'rtl' : 'ltr'}
		>
			{showVerses && (
				<span className={`${themeClasses.accent[theme]} ${sizes.verseNum} font-normal tabular-nums ${isRtl ? 'ml-1.5' : 'mr-2'}`}>
					{getVerseNumber(verse.num, isRtl)}
				</span>
			)}
			{verse.text}
		</p>
	)
}
