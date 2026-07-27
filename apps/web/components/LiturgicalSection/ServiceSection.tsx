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
import { Row } from './Row'
import type { AlignedRow } from './align'

export interface ServiceSectionProps {
	rows: AlignedRow[]
	activeLangs: BibleTranslation[]
	// Per-language scripture reference strings, shown as a header row.
	refsByLang?: Partial<Record<BibleTranslation, string>>
	theme: ReadingTheme
	textSize: TextSize
	fontFamily: FontFamily
	lineSpacing: LineSpacing
	wordSpacing: WordSpacing
	weight: FontWeight
	viewMode?: ViewMode
	showVerses?: boolean
}

// Scroll-mode view of one section: the same aligned rows presentation mode
// pages through, rendered in full. Sharing the rows is what keeps the language
// columns level while scrolling.
export function ServiceSection({ rows, activeLangs, refsByLang, ...style }: ServiceSectionProps) {
	const hasRefs = activeLangs.some((lang) => refsByLang?.[lang])
	return (
		<div className="pt-2 pb-2">
			{hasRefs && (
				<div dir="ltr" className={`grid ${multiLangGridClass(activeLangs.length)} mb-3`}>
					{activeLangs.map((lang) => {
						const { textDir } = getStyleClasses(
							lang,
							style.textSize,
							style.lineSpacing,
							style.fontFamily,
							style.weight,
							style.wordSpacing,
						)
						return (
							<p
								key={lang}
								dir={textDir}
								className={`min-w-0 pl-2 sm:pl-4 text-xs font-medium ${themeClasses.accent[style.theme]} font-mono`}
							>
								{refsByLang?.[lang]}
							</p>
						)
					})}
				</div>
			)}
			{rows.map((row, i) => (
				<Row key={i} row={row} activeLangs={activeLangs} isPageStart={i === 0} {...style} />
			))}
		</div>
	)
}
