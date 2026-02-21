import { getBookName } from '@/i18n/content-translations'
import { getWidthClass, themeClasses } from '@/lib/reading-styles'
import type { Reading } from '@/lib/types'
import type { ReadingTheme, ReadingWidth, ViewMode } from '../DisplaySettings'
import type { BibleTranslation, StyleClasses } from './types'
import { getVerseNumber, toArabicNumerals } from './utils'

interface SingleLanguageContentProps {
	lang: BibleTranslation
	readings: Reading[]
	styleClasses: StyleClasses
	viewMode: ViewMode
	showVerses: boolean
	theme: ReadingTheme
	width: ReadingWidth
}

export function SingleLanguageContent({
	lang,
	readings,
	styleClasses,
	viewMode,
	showVerses,
	theme,
	width,
}: SingleLanguageContentProps) {
	const { isRtl, sizes } = styleClasses
	const widthClass = getWidthClass(width)

	// Count total chapters to determine if we should show chapter headings
	const totalChapters = readings.reduce((sum, r) => sum + r.chapters.length, 0)
	const showChapterHeading = totalChapters > 1

	return (
		<div className={`${widthClass} mx-auto sm:mt-2`}>
			{readings.map((reading, idx) => (
				<div key={idx}>
					{reading.chapters.map((chapter, cidx) => (
						<div key={cidx} className="mb-8">
							{/* Chapter heading - only show for multi-chapter readings */}
							{showChapterHeading && (
								<h3
									className={`text-center ${sizes.chapter} font-bold tracking-wider ${themeClasses.muted[theme]} mb-6 ${isRtl ? 'font-arabic' : 'uppercase'}`}
									dir={isRtl ? 'rtl' : 'ltr'}
								>
									{getBookName(reading.bookName, lang)}{' '}
									{isRtl ? toArabicNumerals(chapter.chapterNum) : chapter.chapterNum}
								</h3>
							)}

							{/* Verses */}
							{viewMode === 'continuous' ? (
								<ContinuousVerses
									verses={chapter.verses}
									styleClasses={styleClasses}
									showVerses={showVerses}
									theme={theme}
								/>
							) : (
								<VerseByVerse
									verses={chapter.verses}
									styleClasses={styleClasses}
									showVerses={showVerses}
									theme={theme}
								/>
							)}
						</div>
					))}
				</div>
			))}
		</div>
	)
}

interface VersesProps {
	verses: { num: number; text: string }[]
	styleClasses: StyleClasses
	showVerses: boolean
	theme: ReadingTheme
}

function ContinuousVerses({ verses, styleClasses, showVerses, theme }: VersesProps) {
	const { isRtl, sizes, lineHeight, fontClass, weightClass, wordSpacingClass } = styleClasses

	return (
		<p
			className={`${fontClass} ${weightClass} ${wordSpacingClass} ${sizes.verse} ${lineHeight} ${themeClasses.text[theme]} ${isRtl ? 'text-right' : !showVerses ? 'first-letter-large' : ''}`}
			dir={isRtl ? 'rtl' : 'ltr'}
		>
			{verses.map((verse, vidx) => (
				<span key={verse.num}>
					{showVerses && (
						<sup
							className={`${sizes.verseNum} font-normal ${themeClasses.accent[theme]} ${isRtl ? 'ml-1' : 'mr-1'}`}
						>
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

function VerseByVerse({ verses, styleClasses, showVerses, theme }: VersesProps) {
	const { isRtl, sizes, lineHeight, fontClass, weightClass, wordSpacingClass } = styleClasses

	return (
		<div
			className={`${isRtl ? 'space-y-6' : 'space-y-4'} ${isRtl ? 'text-right' : ''}`}
			dir={isRtl ? 'rtl' : 'ltr'}
		>
			{verses.map((verse, vidx) => (
				<p
					key={verse.num}
					className={`${fontClass} ${weightClass} ${wordSpacingClass} ${sizes.verse} ${lineHeight} ${themeClasses.text[theme]} ${vidx === 0 && !isRtl && !showVerses ? 'first-letter-large' : ''}`}
				>
					{showVerses && (
						<span
							className={`${themeClasses.accent[theme]} ${sizes.verseNum} font-normal tabular-nums ${isRtl ? 'ml-1.5' : 'mr-2'}`}
						>
							{getVerseNumber(verse.num, isRtl)}
						</span>
					)}
					{verse.text}
				</p>
			))}
		</div>
	)
}
