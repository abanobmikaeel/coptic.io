import { getBookName } from '@/i18n/content-translations'
import { multiLangGridClass, themeClasses } from '@/lib/reading-styles'
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
	// Shared responsive grid class (always side-by-side; mobile compresses gaps).
	const gridClass = multiLangGridClass(orderedLangs.length)

	// Container width - mobile uses full width, larger screens have max-width
	const containerWidth =
		orderedLangs.length >= 4 ? 'max-w-full sm:max-w-[90rem]' : 'max-w-full sm:max-w-7xl'

	// Count total chapters to determine if we should show chapter headings
	const totalChapters = firstReadings.reduce((sum, r) => sum + r.chapters.length, 0)
	const showChapterHeading = totalChapters > 1

	return (
		// dir=ltr keeps language columns in a fixed order so they don't swap sides
		// under an RTL (Arabic) UI locale; each cell sets its own dir for text.
		// -mx-3 sm:mx-auto: extend past the parent's px-3 padding on mobile so
		// multi-language columns get maximum horizontal real estate.
		<div dir="ltr" className={`-mx-3 sm:mx-auto ${containerWidth} sm:mt-2 px-2 sm:px-0`}>
			{firstReadings.map((reading, idx) => (
				<div key={idx}>
					{reading.chapters.map((chapter, cidx) => (
						<div key={cidx} className="mb-5 sm:mb-8">
							{/* Chapter headings - only show for multi-chapter readings */}
							{showChapterHeading && (
								<ChapterHeadings
									orderedLangs={orderedLangs}
									readingsByLang={readingsByLang}
									readingIdx={idx}
									chapterIdx={cidx}
									getStyleClasses={getStyleClasses}
									theme={theme}
									gridClass={gridClass}
								/>
							)}

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
									gridClass={gridClass}
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
									gridClass={gridClass}
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
	gridClass: string
}

function ChapterHeadings({
	orderedLangs,
	readingsByLang,
	readingIdx,
	chapterIdx,
	getStyleClasses,
	theme,
	gridClass,
}: ChapterHeadingsProps) {
	return (
		<div className={`grid ${gridClass} mb-3 sm:mb-5`}>
			{orderedLangs.map((lang) => {
				const langReadings = readingsByLang[lang]
				const langReading = langReadings?.[readingIdx]
				const langChapter = langReading?.chapters[chapterIdx]
				if (!langChapter) return <div key={lang} />

				const { isRtl, textDir, sizes, fontClass } = getStyleClasses(lang)
				const isCoptic = lang === 'cop'
				return (
					<h3
						key={lang}
						className={`text-center ${sizes.chapter} font-bold tracking-wider ${themeClasses.muted[theme]} ${isRtl ? 'font-arabic' : isCoptic ? fontClass : 'uppercase'}`}
						dir={textDir}
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
	gridClass: string
}

function ContinuousVerses({
	orderedLangs,
	readingsByLang,
	readingIdx,
	chapterIdx,
	getStyleClasses,
	showVerses,
	theme,
	gridClass,
}: ContinuousVersesProps) {
	return (
		<div className={`grid ${gridClass}`}>
			{orderedLangs.map((lang) => {
				const langReadings = readingsByLang[lang]
				const langChapter = langReadings?.[readingIdx]?.chapters[chapterIdx]
				if (!langChapter) return <div key={lang} />

				const { isRtl, textDir, sizes, lineHeight, fontClass, weightClass, wordSpacingClass } =
					getStyleClasses(lang)

				return (
					<p
						key={lang}
						className={`min-w-0 break-words ${fontClass} ${weightClass} ${wordSpacingClass} ${sizes.verse} ${lineHeight} ${themeClasses.text[theme]} ${isRtl ? 'text-right' : !showVerses ? 'first-letter-large' : ''}`}
						dir={textDir}
					>
						{langChapter.verses.map((verse, vidx) => (
							<span key={verse.num}>
								{showVerses && (
									<sup
										className={`${sizes.verseNum} font-normal ${themeClasses.accent[theme]} ${isRtl ? 'ml-1' : 'mr-1'}`}
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
	gridClass: string
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
	gridClass,
}: VerseByVerseComparisonProps) {
	return (
		<div className="space-y-3 sm:space-y-4">
			{chapter.verses.map((verse, vidx) => (
				<div key={verse.num} className={`grid ${gridClass}`}>
					{orderedLangs.map((lang) => {
						const langReadings = readingsByLang[lang]
						const langChapter = langReadings?.[readingIdx]?.chapters[chapterIdx]
						const langVerse = langChapter?.verses.find((v) => v.num === verse.num)
						if (!langVerse) return <div key={lang} />

						const { isRtl, textDir, sizes, lineHeight, fontClass, weightClass, wordSpacingClass } =
							getStyleClasses(lang)

						return (
							<p
								key={lang}
								className={`min-w-0 break-words ${fontClass} ${weightClass} ${wordSpacingClass} ${sizes.verse} ${lineHeight} ${themeClasses.text[theme]} ${isRtl ? 'text-right' : ''} ${vidx === 0 && !isRtl && !showVerses ? 'first-letter-large' : ''}`}
								dir={textDir}
							>
								{showVerses && (
									<span
										className={`${themeClasses.accent[theme]} ${sizes.verseNum} font-normal tabular-nums ${isRtl ? 'ml-1.5' : 'mr-2'}`}
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
