import { getBookName } from '@/i18n/content-translations'
import { themeClasses } from '@/lib/reading-styles'
import type { Reading } from '@/lib/types'
import type { ReadingTheme, ViewMode } from '../DisplaySettings'
import type { BibleTranslation, StyleClasses } from './types'
import { getVerseNumber, toArabicNumerals } from './utils'

interface MultiLanguageContentProps {
	orderedLangs: BibleTranslation[]
	readingsByLang: Partial<Record<BibleTranslation, Reading[]>>
	firstReadings: Reading[]
	getStyleClasses: (lang: BibleTranslation) => StyleClasses
	viewMode: ViewMode
	showVerses: boolean
	theme: ReadingTheme
}

export function MultiLanguageContent({
	orderedLangs,
	readingsByLang,
	firstReadings,
	getStyleClasses,
	viewMode,
	showVerses,
	theme,
}: MultiLanguageContentProps) {
	// Dynamic grid columns based on number of languages
	const gridCols =
		orderedLangs.length === 4
			? 'grid-cols-4'
			: orderedLangs.length === 3
				? 'grid-cols-3'
				: 'grid-cols-2'

	// Container width based on number of languages
	const containerWidth = orderedLangs.length >= 4 ? 'max-w-[90rem]' : 'max-w-7xl'

	return (
		<div className={`mx-auto mt-6 px-4 ${containerWidth}`}>
			{firstReadings.map((reading, idx) => (
				<div key={idx}>
					{reading.chapters.map((chapter, cidx) => (
						<div key={cidx} className="mb-12">
							{/* Chapter headings - side by side */}
							<ChapterHeadings
								orderedLangs={orderedLangs}
								readingsByLang={readingsByLang}
								readingIdx={idx}
								chapterIdx={cidx}
								getStyleClasses={getStyleClasses}
								theme={theme}
								gridCols={gridCols}
							/>

							{/* Verses - side by side */}
							{viewMode === 'continuous' ? (
								<ContinuousVerses
									orderedLangs={orderedLangs}
									readingsByLang={readingsByLang}
									readingIdx={idx}
									chapterIdx={cidx}
									getStyleClasses={getStyleClasses}
									showVerses={showVerses}
									theme={theme}
									gridCols={gridCols}
								/>
							) : (
								<VerseByVerseComparison
									orderedLangs={orderedLangs}
									readingsByLang={readingsByLang}
									chapter={chapter}
									readingIdx={idx}
									chapterIdx={cidx}
									getStyleClasses={getStyleClasses}
									showVerses={showVerses}
									theme={theme}
									gridCols={gridCols}
								/>
							)}
						</div>
					))}
				</div>
			))}
		</div>
	)
}

interface ChapterHeadingsProps {
	orderedLangs: BibleTranslation[]
	readingsByLang: Partial<Record<BibleTranslation, Reading[]>>
	readingIdx: number
	chapterIdx: number
	getStyleClasses: (lang: BibleTranslation) => StyleClasses
	theme: ReadingTheme
	gridCols: string
}

function ChapterHeadings({
	orderedLangs,
	readingsByLang,
	readingIdx,
	chapterIdx,
	getStyleClasses,
	theme,
	gridCols,
}: ChapterHeadingsProps) {
	return (
		<div className={`grid ${gridCols} gap-6 mb-8`}>
			{orderedLangs.map((lang) => {
				const langReadings = readingsByLang[lang]
				const langReading = langReadings?.[readingIdx]
				const langChapter = langReading?.chapters[chapterIdx]
				if (!langChapter) return <div key={lang} />

				const { isRtl, sizes, fontClass } = getStyleClasses(lang)
				const isCoptic = lang === 'cop'
				return (
					<h3
						key={lang}
						className={`text-center ${sizes.chapter} font-bold tracking-wider ${themeClasses.muted[theme]} ${isRtl ? 'font-arabic' : isCoptic ? fontClass : 'uppercase'}`}
						dir={isRtl ? 'rtl' : 'ltr'}
					>
						{getBookName(langReading.bookName, lang)}{' '}
						{isRtl ? toArabicNumerals(langChapter.chapterNum) : langChapter.chapterNum}
					</h3>
				)
			})}
		</div>
	)
}

interface ContinuousVersesProps {
	orderedLangs: BibleTranslation[]
	readingsByLang: Partial<Record<BibleTranslation, Reading[]>>
	readingIdx: number
	chapterIdx: number
	getStyleClasses: (lang: BibleTranslation) => StyleClasses
	showVerses: boolean
	theme: ReadingTheme
	gridCols: string
}

function ContinuousVerses({
	orderedLangs,
	readingsByLang,
	readingIdx,
	chapterIdx,
	getStyleClasses,
	showVerses,
	theme,
	gridCols,
}: ContinuousVersesProps) {
	return (
		<div className={`grid ${gridCols} gap-6`}>
			{orderedLangs.map((lang) => {
				const langReadings = readingsByLang[lang]
				const langChapter = langReadings?.[readingIdx]?.chapters[chapterIdx]
				if (!langChapter) return <div key={lang} />

				const { isRtl, sizes, lineHeight, fontClass, weightClass, wordSpacingClass } =
					getStyleClasses(lang)

				return (
					<p
						key={lang}
						className={`${fontClass} ${weightClass} ${wordSpacingClass} ${sizes.verse} ${lineHeight} ${themeClasses.text[theme]} ${isRtl ? 'text-right' : !showVerses ? 'first-letter-large' : ''}`}
						dir={isRtl ? 'rtl' : 'ltr'}
					>
						{langChapter.verses.map((verse, vidx) => (
							<span key={verse.num}>
								{showVerses && (
									<sup
										className={`${sizes.verseNum} font-normal ${themeClasses.accent[theme]} ${isRtl ? 'ml-1.5' : 'mr-1'}`}
									>
										{getVerseNumber(verse.num, isRtl)}
									</sup>
								)}
								<span>{verse.text}</span>
								{vidx < langChapter.verses.length - 1 && ' '}
							</span>
						))}
					</p>
				)
			})}
		</div>
	)
}

interface VerseByVerseComparisonProps {
	orderedLangs: BibleTranslation[]
	readingsByLang: Partial<Record<BibleTranslation, Reading[]>>
	chapter: { verses: { num: number; text: string }[] }
	readingIdx: number
	chapterIdx: number
	getStyleClasses: (lang: BibleTranslation) => StyleClasses
	showVerses: boolean
	theme: ReadingTheme
	gridCols: string
}

function VerseByVerseComparison({
	orderedLangs,
	readingsByLang,
	chapter,
	readingIdx,
	chapterIdx,
	getStyleClasses,
	showVerses,
	theme,
	gridCols,
}: VerseByVerseComparisonProps) {
	return (
		<div className="space-y-4">
			{chapter.verses.map((verse, vidx) => (
				<div key={verse.num} className={`grid ${gridCols} gap-6`}>
					{orderedLangs.map((lang) => {
						const langReadings = readingsByLang[lang]
						const langChapter = langReadings?.[readingIdx]?.chapters[chapterIdx]
						const langVerse = langChapter?.verses.find((v) => v.num === verse.num)
						if (!langVerse) return <div key={lang} />

						const { isRtl, sizes, lineHeight, fontClass, weightClass, wordSpacingClass } =
							getStyleClasses(lang)

						return (
							<p
								key={lang}
								className={`${fontClass} ${weightClass} ${wordSpacingClass} ${sizes.verse} ${lineHeight} ${themeClasses.text[theme]} ${isRtl ? 'text-right' : ''} ${vidx === 0 && !isRtl && !showVerses ? 'first-letter-large' : ''}`}
								dir={isRtl ? 'rtl' : 'ltr'}
							>
								{showVerses && (
									<span
										className={`${themeClasses.accent[theme]} ${sizes.verseNum} font-normal tabular-nums ${isRtl ? 'ml-3' : 'mr-2'}`}
									>
										{getVerseNumber(langVerse.num, isRtl)}
									</span>
								)}
								{langVerse.text}
							</p>
						)
					})}
				</div>
			))}
		</div>
	)
}
