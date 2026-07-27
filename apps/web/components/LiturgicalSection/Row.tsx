import type { ReadingTheme } from '@/components/DisplaySettings'
import type {
	FontFamily,
	FontWeight,
	LineSpacing,
	TextSize,
	WordSpacing,
} from '@/components/DisplaySettings'
import type { BibleTranslation } from '@/components/ScriptureReading/types'
import { getStyleClasses } from '@/components/ScriptureReading/utils'
import type { ViewMode } from '@/lib/reading-preferences'
import { multiLangGridClass, themeClasses } from '@/lib/reading-styles'
import { RubricLine } from './RubricLine'
import type { AlignedRow } from './align'
import { PRESERVE_LABEL_CASE, getSpeakerLabel } from './speakers'
import type { FlatLine, Speaker } from './turns'

export interface RowProps {
	row: AlignedRow
	activeLangs: BibleTranslation[]
	// First row of a page (presentation) or of the section (scroll): repeat the
	// current speaker label for context even mid-turn.
	isPageStart?: boolean
	theme: ReadingTheme
	textSize: TextSize
	fontFamily: FontFamily
	lineSpacing: LineSpacing
	wordSpacing: WordSpacing
	weight: FontWeight
	showVerses?: boolean
	viewMode?: ViewMode
}

// One aligned row: a fixed-order grid with one cell per displayed language.
// Stacked rows form the whole section; because every row shares the same grid
// template, the columns line up from row to row and the row height (the
// tallest cell) is what keeps translations level with each other.
export function Row({ row, activeLangs, isPageStart = false, ...style }: RowProps) {
	return (
		// dir=ltr pins the column order under an RTL locale; cells set their own dir.
		<div dir="ltr" className={`grid ${multiLangGridClass(activeLangs.length)}`}>
			{activeLangs.map((lang) => (
				<Cell
					key={lang}
					lines={row.cells[lang] ?? []}
					lang={lang}
					isPageStart={isPageStart}
					{...style}
				/>
			))}
		</div>
	)
}

interface CellProps extends Omit<RowProps, 'row' | 'activeLangs' | 'isPageStart'> {
	lines: FlatLine[]
	lang: BibleTranslation
	isPageStart: boolean
}

function Cell({
	lines,
	lang,
	isPageStart,
	theme,
	textSize,
	fontFamily,
	lineSpacing,
	wordSpacing,
	weight,
	showVerses = true,
	viewMode = 'verse',
}: CellProps) {
	const { isRtl, textDir, sizes, lineHeight, fontClass, weightClass, wordSpacingClass } =
		getStyleClasses(lang, textSize, lineSpacing, fontFamily, weight, wordSpacing)

	// The empty cell keeps its border so the column rule stays continuous when a
	// language has nothing on this row (e.g. a rubric it doesn't carry).
	const cellClass = 'min-w-0 break-words pl-2 sm:pl-4 border-l-2 border-current/10 pb-3'
	if (!lines.length) return <div className={cellClass} dir={textDir} />

	const proseClass = `${sizes.verse} ${lineHeight} ${fontClass} ${weightClass} ${wordSpacingClass} ${themeClasses.text[theme]}`
	const speakerColor = (speaker?: Speaker) =>
		speaker === 'Priest'
			? themeClasses.accent[theme]
			: speaker === 'Deacon'
				? 'text-blue-400 dark:text-blue-300'
				: themeClasses.muted[theme]
	const labelClass = (speaker?: Speaker) =>
		isRtl || PRESERVE_LABEL_CASE.has(lang)
			? `text-sm font-semibold mb-1.5 ${fontClass} ${speakerColor(speaker)}`
			: `text-xs font-semibold tracking-widest uppercase mb-1.5 ${speakerColor(speaker)}`

	// Continuous scripture: the cell's verses flow as one paragraph.
	if (viewMode === 'continuous' && lines.some((line) => line.num != null)) {
		return (
			<div dir={textDir} className={cellClass}>
				<p className={proseClass}>
					{lines.map((line, i) => (
						<span key={`${line.num ?? 'line'}-${i}`}>
							{showVerses && line.num != null && (
								<sup className={`${themeClasses.muted[theme]} font-mono me-1 text-[0.65em]`}>
									{line.num}
								</sup>
							)}
							{line.text}{' '}
						</span>
					))}
				</p>
			</div>
		)
	}

	return (
		<div dir={textDir} className={`${cellClass} flex flex-col gap-3`}>
			{lines.map((line, i) => {
				const showLabel = !!line.speaker && (line.isNewSpeakerGroup || (isPageStart && i === 0))
				const label = line.speaker ? getSpeakerLabel(lang, line.speaker) : undefined
				return (
					<div key={i} className={showLabel && i > 0 ? 'pt-1' : ''}>
						{showLabel && label && <p className={labelClass(line.speaker)}>{label}</p>}
						{line.num != null ? (
							<p className={`${proseClass} flex gap-1.5 sm:gap-3`}>
								{showVerses && (
									<span
										className={`${sizes.verseNum} ${themeClasses.muted[theme]} flex-shrink-0 pt-0.5 font-mono w-4 sm:w-6 text-right`}
									>
										{line.num}
									</span>
								)}
								<span className="min-w-0">{line.text}</span>
							</p>
						) : line.isRubric ? (
							<RubricLine
								text={line.text}
								lang={lang}
								theme={theme}
								isRtl={isRtl}
								fontClass={fontClass}
							/>
						) : (
							<p className={proseClass}>{line.text}</p>
						)}
					</div>
				)
			})}
		</div>
	)
}
