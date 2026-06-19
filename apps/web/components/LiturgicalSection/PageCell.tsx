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
import { themeClasses } from '@/lib/reading-styles'
import { RubricLine } from './RubricLine'
import { PRESERVE_LABEL_CASE, getSpeakerLabel } from './speakers'
import type { FlatLine } from './turns'

export interface PageCellProps {
	lines: FlatLine[]
	lang: BibleTranslation
	theme: ReadingTheme
	textSize: TextSize
	fontFamily: FontFamily
	lineSpacing: LineSpacing
	wordSpacing: WordSpacing
	weight: FontWeight
	showVerses?: boolean
	viewMode?: ViewMode
}

export function PageCell({
	lines,
	lang,
	theme,
	textSize,
	fontFamily,
	lineSpacing,
	wordSpacing,
	weight,
	showVerses = true,
	viewMode = 'verse',
}: PageCellProps) {
	if (!lines.length) return <div />

	const { isRtl, textDir, sizes, lineHeight, fontClass, weightClass, wordSpacingClass } =
		getStyleClasses(lang, textSize, lineSpacing, fontFamily, weight, wordSpacing)
	const proseClass = `${sizes.verse} ${lineHeight} ${fontClass} ${weightClass} ${wordSpacingClass} ${themeClasses.text[theme]}`
	const speakerColor = (speaker?: string) =>
		speaker === 'Priest'
			? themeClasses.accent[theme]
			: speaker === 'Deacon'
				? 'text-blue-400 dark:text-blue-300'
				: themeClasses.muted[theme]
	const labelClass = (speaker?: string) =>
		isRtl || PRESERVE_LABEL_CASE.has(lang)
			? `text-sm font-semibold mb-1.5 ${fontClass} ${speakerColor(speaker)}`
			: `text-xs font-semibold tracking-widest uppercase mb-1.5 ${speakerColor(speaker)}`

	// Render a single verse line (study / verse-by-verse mode).
	const renderVerseLine = (line: FlatLine) => (
		<p className={`${proseClass} flex gap-3`}>
			{showVerses && (
				<span
					className={`${sizes.verseNum} ${themeClasses.muted[theme]} flex-shrink-0 pt-0.5 font-mono w-6 text-right`}
				>
					{line.num}
				</span>
			)}
			<span>{line.text}</span>
		</p>
	)

	// ── Continuous verse rendering ───────────────────────────────────────
	// Scripture flows as one real paragraph. The inline markers preserve a
	// measurable boundary after each verse so PresentationView can paginate
	// without forcing every verse onto a new visual line.

	if (viewMode === 'continuous' && lines.some((line) => line.num != null)) {
		return (
			<div
				dir={textDir}
				className="min-w-0 pl-4 border-l-2 border-current/10"
			>
				<p className={proseClass}>
					{lines.map((line, i) => (
						<span key={`${line.num ?? 'line'}-${i}`} data-page-line>
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

	// ── Verse-by-verse (study) mode ──────────────────────────────────────

	return (
		<div
			dir={textDir}
			className="min-w-0 flex flex-col pl-4 border-l-2 border-current/10 space-y-3"
		>
			{lines.map((line, i) => {
				// Show speaker label when speaker changes, or at top of page for context
				const showLabel = !line.isSpacer && !!line.speaker && (line.isNewSpeakerGroup || i === 0)
				const label = line.speaker ? getSpeakerLabel(lang, line.speaker) : undefined
				// A spacer pads this column where another language has a rubric — render the
				// rubric markup invisibly so it occupies the same height and rows stay aligned.
				if (line.isSpacer) {
					return (
						<div key={i} className="invisible" aria-hidden>
							{line.isRubric ? (
								<RubricLine
									text={line.text}
									lang={lang}
									theme={theme}
									isRtl={isRtl}
									fontClass={fontClass}
								/>
							) : (
								<p className={proseClass}>&nbsp;</p>
							)}
						</div>
					)
				}
				return (
					<div key={i} className={showLabel && i > 0 ? 'pt-1' : ''}>
						{showLabel && label && <p className={labelClass(line.speaker)}>{label}</p>}
						{line.num != null ? (
							renderVerseLine(line)
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
