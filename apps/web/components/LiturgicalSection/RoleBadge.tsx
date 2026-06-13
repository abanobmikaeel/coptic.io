import type { ReadingTheme } from '@/components/DisplaySettings'
import type { BibleTranslation } from '@/components/ScriptureReading/types'
import { getStyleClasses } from '@/components/ScriptureReading/utils'
import { themeClasses } from '@/lib/reading-styles'
import type { IncenseSectionRole } from '@/lib/types'
import { FONT_ENCODES_GLYPHS, ROLE_LABELS } from './speakers'

interface RoleBadgeProps {
	role: IncenseSectionRole
	lang: string
	theme: ReadingTheme
}

export function RoleBadge({ role, lang, theme }: RoleBadgeProps) {
	const { isRtl, textDir, fontClass } = getStyleClasses(
		lang as BibleTranslation,
		'md',
		'normal',
		'sans',
		'normal',
		'normal',
	)
	const label = ROLE_LABELS[lang]?.[role] ?? ROLE_LABELS.en?.[role]
	if (!label) return null
	const color = role === 'priest' ? themeClasses.accent[theme] : themeClasses.muted[theme]
	const labelClass =
		isRtl || FONT_ENCODES_GLYPHS.has(lang)
			? `text-sm font-medium ${fontClass} ${color}`
			: `text-xs font-medium tracking-wide uppercase ${color}`
	return (
		<span className={labelClass} dir={textDir}>
			{label}
		</span>
	)
}
