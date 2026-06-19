import type { ReadingTheme } from '@/components/DisplaySettings'
import type {
	FontFamily,
	FontWeight,
	LineSpacing,
	TextSize,
	WordSpacing,
} from '@/components/DisplaySettings'
import type { BibleTranslation } from '@/components/ScriptureReading/types'
import type { ViewMode } from '@/lib/reading-preferences'
import type { IncenseService } from '@/lib/types'
import { SectionColumn } from './SectionColumn'
import { TurnCell } from './TurnCell'
import { groupByTurns } from './turns'

export const GRID_COLS: Record<number, string> = { 1: '', 2: 'lg:grid-cols-2', 3: 'lg:grid-cols-3' }

export interface ServiceSectionProps {
	sectionId: string
	servicesByLang: Partial<Record<string, IncenseService>>
	langs: BibleTranslation[]
	theme: ReadingTheme
	textSize: TextSize
	fontFamily: FontFamily
	lineSpacing: LineSpacing
	wordSpacing: WordSpacing
	weight: FontWeight
	viewMode?: ViewMode
	showVerses?: boolean
}

export function ServiceSection({
	sectionId,
	servicesByLang,
	langs,
	theme,
	textSize,
	fontFamily,
	lineSpacing,
	wordSpacing,
	weight,
	viewMode,
	showVerses,
}: ServiceSectionProps) {
	const primaryLang = langs[0] ?? 'en'
	const primarySection = servicesByLang[primaryLang]?.sections.find((s) => s.id === sectionId)
	if (!primarySection) return null

	const gridClass = GRID_COLS[langs.length] ?? ''
	const isScripture =
		primarySection.type === 'psalm' ||
		primarySection.type === 'gospel' ||
		primarySection.type === 'daily-psalm'
	const isMultiLang = langs.length > 1
	const sharedProps = {
		theme,
		textSize,
		fontFamily,
		lineSpacing,
		wordSpacing,
		weight,
		viewMode,
		showVerses,
	}

	if (!isScripture && isMultiLang) {
		const turnsByLang = Object.fromEntries(
			langs.map((lang) => {
				const sec = servicesByLang[lang]?.sections.find((s) => s.id === sectionId)
				return [lang, groupByTurns(sec?.content ?? [])]
			}),
		)
		const turnCounts = langs.map((l) => turnsByLang[l]?.length ?? 0)
		if (turnCounts.every((c) => c === turnCounts[0]) && turnCounts[0] > 0) {
			return (
				<div className={`grid gap-x-6 ${gridClass}`}>
					{Array.from({ length: turnCounts[0] }, (_, i) =>
						langs.map((lang) => (
							<TurnCell
								key={`${lang}-${i}`}
								turn={turnsByLang[lang]?.[i]}
								lang={lang}
								{...sharedProps}
							/>
						)),
					).flat()}
				</div>
			)
		}
	}

	return (
		<div className={`pt-2 pb-2 grid gap-6 ${gridClass}`}>
			{langs.map((lang) => (
				<SectionColumn
					key={lang}
					section={servicesByLang[lang]?.sections.find((s) => s.id === sectionId)}
					lang={lang}
					{...sharedProps}
				/>
			))}
		</div>
	)
}
