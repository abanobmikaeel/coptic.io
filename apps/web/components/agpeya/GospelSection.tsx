'use client'

import type { ViewMode } from '@/lib/reading-preferences'
import { CollapsibleSection } from './CollapsibleSection'
import { GospelContent } from './GospelContent'
import type { AgpeyaGospel, ThemeStyles } from './types'

interface GospelSectionProps {
	gospel: AgpeyaGospel
	textStyles: string
	verseNumClass: string
	themeStyles: ThemeStyles
	isRtl: boolean
	viewMode: ViewMode
	forceCollapsed?: boolean
}

export function GospelSection({
	gospel,
	textStyles,
	verseNumClass,
	themeStyles,
	isRtl,
	viewMode,
	forceCollapsed,
}: GospelSectionProps) {
	return (
		<section id="section-gospel" className="scroll-mt-24">
			<CollapsibleSection
				title="Gospel"
				subtitle={gospel.reference}
				themeStyles={themeStyles}
				defaultOpen
				forceCollapsed={forceCollapsed}
			>
				<GospelContent
					gospel={gospel}
					textStyles={textStyles}
					verseNumClass={verseNumClass}
					themeStyles={themeStyles}
					isRtl={isRtl}
					viewMode={viewMode}
				/>
			</CollapsibleSection>
		</section>
	)
}
