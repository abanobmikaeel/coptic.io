import type { ReadingTheme } from '@/components/DisplaySettings'
import type { BibleTranslation } from '@/components/ScriptureReading/types'
import { themeClasses } from '@/lib/reading-styles'
import { PRESERVE_LABEL_CASE } from './speakers'

// Below this length a rubric reads as a small-caps divider (with flanking rules);
// longer instructions render as a centered note so they stay legible.
const DIVIDER_MAX = 46

export interface RubricLineProps {
	text: string
	lang: BibleTranslation
	theme: ReadingTheme
	isRtl: boolean
	// The language's body font class, used for non-Latin scripts.
	fontClass: string
}

// Instructional text (stage directions like "On Sunday, add:") set apart from the chanted
// prayer as its own muted divider line, so a reader never mistakes it for text to be said.
export function RubricLine({ text, lang, theme, isRtl, fontClass }: RubricLineProps) {
	const preserveCase = PRESERVE_LABEL_CASE.has(lang)
	const muted = themeClasses.muted[theme]
	// Small-caps only for cased Latin scripts.
	const caps = !isRtl && !preserveCase
	const typeClass = preserveCase ? fontClass : ''

	if (text.length <= DIVIDER_MAX) {
		return (
			<div dir={isRtl ? 'rtl' : 'ltr'} className={`flex items-center gap-3 my-3 ${muted}`}>
				<span className="h-px flex-1 bg-current opacity-20" />
				<span
					className={`flex-shrink-0 text-[0.7rem] ${caps ? 'uppercase tracking-[0.15em]' : 'italic'} ${typeClass}`}
				>
					{text}
				</span>
				<span className="h-px flex-1 bg-current opacity-20" />
			</div>
		)
	}

	return (
		<p
			dir={isRtl ? 'rtl' : 'ltr'}
			className={`my-3 text-center text-sm italic ${typeClass} ${muted}`}
		>
			{text}
		</p>
	)
}
