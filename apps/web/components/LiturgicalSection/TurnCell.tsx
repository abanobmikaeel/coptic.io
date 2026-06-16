'use client'

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
import { themeClasses } from '@/lib/reading-styles'
import { RubricLine } from './RubricLine'
import { FONT_ENCODES_GLYPHS, getSpeakerLabel } from './speakers'
import type { Turn } from './turns'

export interface TurnCellProps {
	turn: Turn | undefined
	lang: BibleTranslation
	theme: ReadingTheme
	textSize: TextSize
	fontFamily: FontFamily
	lineSpacing: LineSpacing
	wordSpacing: WordSpacing
	weight: FontWeight
}

export function TurnCell({
	turn,
	lang,
	theme,
	textSize,
	fontFamily,
	lineSpacing,
	wordSpacing,
	weight,
}: TurnCellProps) {
	const { isRtl, textDir, sizes, lineHeight, fontClass, weightClass, wordSpacingClass } =
		getStyleClasses(lang, textSize, lineSpacing, fontFamily, weight, wordSpacing)
	const proseClass = `${sizes.verse} ${lineHeight} ${fontClass} ${weightClass} ${wordSpacingClass} ${themeClasses.text[theme]}`
	const speakerLabel = turn?.speaker ? getSpeakerLabel(lang, turn.speaker) : undefined
	const speakerColor =
		turn?.speaker === 'Priest'
			? themeClasses.accent[theme]
			: turn?.speaker === 'Deacon'
				? 'text-blue-400 dark:text-blue-300'
				: themeClasses.muted[theme]
	// Glyph-encoded fonts (e.g. CS Avva Shenouda) must not have CSS text-transform applied —
	// the browser would uppercase the ASCII before the font maps it to glyphs.
	// Also use text-sm for non-Latin scripts since they render smaller optically at text-xs.
	const labelClass =
		isRtl || FONT_ENCODES_GLYPHS.has(lang)
			? `text-sm font-semibold mb-1.5 ${fontClass} ${speakerColor}`
			: `text-xs font-semibold tracking-widest uppercase mb-1.5 ${speakerColor}`

	return (
		<div dir={textDir} className="min-w-0 flex flex-col py-2 border-b border-current/10">
			{speakerLabel && <p className={labelClass}>{speakerLabel}</p>}
			{turn?.lines.map((line, i) => {
				const text = typeof line === 'object' ? line.text : line
				const isRubricLine = typeof line === 'object' && line.isRubric
				return isRubricLine ? (
					<RubricLine
						key={i}
						text={text}
						lang={lang}
						theme={theme}
						isRtl={isRtl}
						fontClass={fontClass}
					/>
				) : (
					<p key={i} className={proseClass}>
						{text}
					</p>
				)
			})}
		</div>
	)
}
