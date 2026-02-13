'use client'

import { CollapsibleSection } from './CollapsibleSection'
import { InlinePrayer } from './InlinePrayer'
import type { AgpeyaPrayerSection, ThemeStyles } from './types'

interface PrayerSectionProps {
	id: string
	section: AgpeyaPrayerSection
	defaultTitle: string
	textStyles: string
	themeStyles: ThemeStyles
	isRtl: boolean
	forceCollapsed?: boolean
}

export function PrayerSection({
	id,
	section,
	defaultTitle,
	textStyles,
	themeStyles,
	isRtl,
	forceCollapsed,
}: PrayerSectionProps) {
	const title = section.title || defaultTitle

	if (section.inline) {
		return (
			<section id={id} className="scroll-mt-24">
				<InlinePrayer content={section.content} textStyles={textStyles} isRtl={isRtl} />
			</section>
		)
	}

	return (
		<section id={id} className="scroll-mt-24">
			<CollapsibleSection
				title={title}
				themeStyles={themeStyles}
				defaultOpen
				forceCollapsed={forceCollapsed}
			>
				<InlinePrayer content={section.content} textStyles={textStyles} isRtl={isRtl} />
			</CollapsibleSection>
		</section>
	)
}
