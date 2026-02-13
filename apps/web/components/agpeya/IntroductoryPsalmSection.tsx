'use client'

import type { ViewMode } from '@/lib/reading-preferences'
import { CollapsibleSection } from './CollapsibleSection'
import { VerseDisplay } from './VerseDisplay'
import type { AgpeyaPsalm, ThemeStyles } from './types'

interface IntroductoryPsalmSectionProps {
	psalm: AgpeyaPsalm
	textStyles: string
	verseNumClass: string
	themeStyles: ThemeStyles
	isRtl: boolean
	viewMode: ViewMode
	forceCollapsed?: boolean
}

export function IntroductoryPsalmSection({
	psalm,
	textStyles,
	verseNumClass,
	themeStyles,
	isRtl,
	viewMode,
	forceCollapsed,
}: IntroductoryPsalmSectionProps) {
	return (
		<section id="section-introductory-psalm" className="scroll-mt-32">
			<CollapsibleSection
				title={psalm.title || 'Psalm 50'}
				subtitle={psalm.reference}
				themeStyles={themeStyles}
				defaultOpen
				forceCollapsed={forceCollapsed}
			>
				<VerseDisplay
					verses={psalm.verses}
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
