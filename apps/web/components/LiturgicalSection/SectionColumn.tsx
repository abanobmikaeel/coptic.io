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
import type { IncenseSection } from '@/lib/types'
import { RubricLine } from './RubricLine'
import { PRESERVE_LABEL_CASE, getSpeakerLabel } from './speakers'

export interface SectionColumnProps {
	section: IncenseSection | undefined
	lang: BibleTranslation
	theme: ReadingTheme
	textSize: TextSize
	fontFamily: FontFamily
	lineSpacing: LineSpacing
	wordSpacing: WordSpacing
	weight: FontWeight
	viewMode?: ViewMode
	showVerses?: boolean
}

export function SectionColumn({
	section,
	lang,
	theme,
	textSize,
	fontFamily,
	lineSpacing,
	wordSpacing,
	weight,
	viewMode = 'verse',
	showVerses = true,
}: SectionColumnProps) {
	if (!section) return <div />
	const { isRtl, textDir, sizes, lineHeight, fontClass, weightClass, wordSpacingClass } =
		getStyleClasses(lang, textSize, lineSpacing, fontFamily, weight, wordSpacing)
	const proseClass = `${sizes.verse} ${lineHeight} ${fontClass} ${weightClass} ${wordSpacingClass} ${themeClasses.text[theme]}`
	const isScripture =
		section.type === 'psalm' || section.type === 'gospel' || section.type === 'daily-psalm'
	const hasVerses = (section.verses ?? []).length > 0
	const hasContent = (section.content ?? []).length > 0

	return (
		<div dir={textDir} className="min-w-0">
			{section.reference && isScripture && (
				<p className={`text-xs font-medium mb-3 ${themeClasses.accent[theme]} font-mono`}>
					{section.reference}
				</p>
			)}
			{isScripture && hasVerses ? (
				<div
					className={`pl-4 border-l-2 ${section.role === 'all' ? themeClasses.border[theme] : 'border-amber-500/40'}`}
				>
					{viewMode === 'continuous' ? (
						// Reading mode: verses flow as one paragraph with small inline numbers.
						<p className={proseClass}>
							{section.verses!.map((verse) => (
								<span key={verse.num}>
									{showVerses && (
										<sup className={`${themeClasses.muted[theme]} font-mono me-1 text-[0.65em]`}>
											{verse.num}
										</sup>
									)}
									{verse.text}{' '}
								</span>
							))}
						</p>
					) : (
						// Study mode: one verse per line with a number column.
						<div className="space-y-3">
							{section.verses!.map((verse) => (
								<p key={verse.num} className={`${proseClass} flex gap-3`}>
									{showVerses && (
										<span
											className={`${sizes.verseNum} ${themeClasses.muted[theme]} flex-shrink-0 pt-0.5 font-mono w-6 text-right`}
										>
											{verse.num}
										</span>
									)}
									<span>{verse.text}</span>
								</p>
							))}
						</div>
					)}
				</div>
			) : hasContent ? (
				<div className={`pl-4 border-l-2 space-y-3 ${themeClasses.border[theme]}`}>
					{section.content!.map((line, i) => {
						const isStructured = typeof line === 'object'
						const text = isStructured ? line.text : line
						const speaker = isStructured ? line.speaker : undefined
						const isRubricLine = isStructured && line.isRubric
						const speakerLabel = speaker ? getSpeakerLabel(lang, speaker) : undefined
						const speakerColor =
							speaker === 'Priest'
								? themeClasses.accent[theme]
								: speaker === 'Deacon'
									? 'text-blue-400 dark:text-blue-300'
									: themeClasses.muted[theme]
						const labelClass =
							isRtl || PRESERVE_LABEL_CASE.has(lang)
								? `text-sm font-semibold ${fontClass} ${speakerColor}`
								: `text-xs font-semibold tracking-widest uppercase ${speakerColor}`
						return (
							<div key={i} className={speakerLabel ? 'space-y-0.5' : ''}>
								{speakerLabel && <p className={labelClass}>{speakerLabel}</p>}
								{isRubricLine ? (
									<RubricLine
										text={text}
										lang={lang}
										theme={theme}
										isRtl={isRtl}
										fontClass={fontClass}
									/>
								) : (
									<p className={proseClass}>{text}</p>
								)}
							</div>
						)
					})}
				</div>
			) : null}
		</div>
	)
}
