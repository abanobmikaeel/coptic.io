import { getBookName } from '@/i18n/content-translations'
import { getWidthClass, themeClasses } from '@/lib/reading-styles'
import type { Reading } from '@/lib/types'
import type { ReadingTheme, ReadingWidth, ViewMode } from '../DisplaySettings'
import type { BibleTranslation, StyleClasses } from './types'
import { toArabicNumerals } from './utils'
import { ContinuousParagraph, VerseParagraph } from './VerseContent'

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

	const totalChapters = readings.reduce((sum, r) => sum + r.chapters.length, 0)
	const showChapterHeading = totalChapters > 1

	return (
		<div className={`${widthClass} mx-auto sm:mt-2`}>
			{readings.map((reading, idx) => (
				<div key={idx}>
					{reading.chapters.map((chapter, cidx) => (
						<div key={cidx} className="mb-8">
							{showChapterHeading && (
								<h3
									className={`text-center ${sizes.chapter} font-bold tracking-wider ${themeClasses.muted[theme]} mb-6 ${isRtl ? 'font-arabic' : 'uppercase'}`}
									dir={isRtl ? 'rtl' : 'ltr'}
								>
									{getBookName(reading.bookName, lang)}{' '}
									{isRtl ? toArabicNumerals(chapter.chapterNum) : chapter.chapterNum}
								</h3>
							)}

							{viewMode === 'continuous' ? (
								<ContinuousParagraph
									verses={chapter.verses}
									styleClasses={styleClasses}
									showVerses={showVerses}
									theme={theme}
								/>
							) : (
								<div className={isRtl ? 'space-y-6' : 'space-y-4'} dir={isRtl ? 'rtl' : 'ltr'}>
									{chapter.verses.map((verse, vidx) => (
										<VerseParagraph
											key={verse.num}
											verse={verse}
											styleClasses={styleClasses}
											showVerses={showVerses}
											theme={theme}
											isFirst={vidx === 0}
										/>
									))}
								</div>
							)}
						</div>
					))}
				</div>
			))}
		</div>
	)
}
