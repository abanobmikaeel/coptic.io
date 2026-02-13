'use client'

import type { ViewMode } from '@/lib/reading-preferences'
import { CollapsibleSection } from './CollapsibleSection'
import { PsalmContent } from './PsalmContent'
import type { AgpeyaPsalm, ThemeStyles } from './types'

interface PsalmsSectionProps {
	psalms: AgpeyaPsalm[]
	psalmsIntro?: string
	textStyles: string
	verseNumClass: string
	themeStyles: ThemeStyles
	isRtl: boolean
	viewMode: ViewMode
	forceCollapsed?: boolean
}

export function PsalmsSection({
	psalms,
	psalmsIntro,
	textStyles,
	verseNumClass,
	themeStyles,
	isRtl,
	viewMode,
	forceCollapsed,
}: PsalmsSectionProps) {
	return (
		<section id="section-psalms" className="scroll-mt-24">
			{psalmsIntro && <p className={`text-sm italic mb-4 ${themeStyles.muted}`}>{psalmsIntro}</p>}
			<CollapsibleSection
				title="Psalms"
				subtitle={`(${psalms.length})`}
				themeStyles={themeStyles}
				defaultOpen
				forceCollapsed={forceCollapsed}
			>
				<div className="space-y-6">
					{psalms.map((psalm, idx) => (
						<PsalmContent
							key={idx}
							psalm={psalm}
							textStyles={textStyles}
							verseNumClass={verseNumClass}
							themeStyles={themeStyles}
							isRtl={isRtl}
							viewMode={viewMode}
						/>
					))}
				</div>
			</CollapsibleSection>
		</section>
	)
}
