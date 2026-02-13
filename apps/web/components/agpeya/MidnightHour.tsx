'use client'

import type { MidnightWatch } from '@/components/AgpeyaHourSelector'
import type { ViewMode } from '@/lib/reading-preferences'
import { CollapsibleSection } from './CollapsibleSection'
import { GospelSection } from './GospelSection'
import { HourHeader } from './HourHeader'
import { InlinePrayer } from './InlinePrayer'
import { IntroductoryPsalmSection } from './IntroductoryPsalmSection'
import { PrayerSection } from './PrayerSection'
import { PsalmsSection } from './PsalmsSection'
import type { AgpeyaMidnightData, ThemeStyles } from './types'

interface MidnightHourProps {
	hour: AgpeyaMidnightData
	currentWatch?: MidnightWatch
	textStyles: string
	verseNumClass: string
	themeStyles: ThemeStyles
	isRtl: boolean
	viewMode: ViewMode
	allCollapsed: boolean
}

export function MidnightHour({
	hour,
	currentWatch,
	textStyles,
	verseNumClass,
	themeStyles,
	isRtl,
	viewMode,
	allCollapsed,
}: MidnightHourProps) {
	const watchIndex = currentWatch ? parseInt(currentWatch, 10) - 1 : 0
	const watch = hour.watches[watchIndex]

	if (!watch) {
		return <div>Watch not found</div>
	}

	return (
		<div>
			<HourHeader
				title={`${hour.name} - ${watch.name}`}
				subtitle={watch.theme}
				introduction={hour.introduction}
				themeStyles={themeStyles}
			/>

			<div className="space-y-8">
				{/* Opening */}
				<section id="section-introduction" className="scroll-mt-24">
					<InlinePrayer content={hour.opening.content} textStyles={textStyles} isRtl={isRtl} />
					{watch.opening && (
						<div className="mt-4">
							<InlinePrayer content={watch.opening.content} textStyles={textStyles} isRtl={isRtl} />
						</div>
					)}
				</section>

				{/* Thanksgiving (shared) */}
				{hour.thanksgiving && (
					<PrayerSection
						id="section-thanksgiving"
						section={hour.thanksgiving}
						defaultTitle="Thanksgiving"
						textStyles={textStyles}
						themeStyles={themeStyles}
						isRtl={isRtl}
					/>
				)}

				{/* Introductory Psalm (shared) */}
				{hour.introductoryPsalm && (
					<IntroductoryPsalmSection
						psalm={hour.introductoryPsalm}
						textStyles={textStyles}
						verseNumClass={verseNumClass}
						themeStyles={themeStyles}
						isRtl={isRtl}
						viewMode={viewMode}
					/>
				)}

				{/* Watch Psalms */}
				<PsalmsSection
					psalms={watch.psalms}
					textStyles={textStyles}
					verseNumClass={verseNumClass}
					themeStyles={themeStyles}
					isRtl={isRtl}
					viewMode={viewMode}
					forceCollapsed={allCollapsed}
				/>

				{/* Watch Gospel */}
				{watch.gospel && (
					<GospelSection
						gospel={watch.gospel}
						textStyles={textStyles}
						verseNumClass={verseNumClass}
						themeStyles={themeStyles}
						isRtl={isRtl}
						viewMode={viewMode}
					/>
				)}

				{/* Watch Litanies */}
				{watch.litanies && (
					<section id="section-litanies" className="scroll-mt-24">
						<CollapsibleSection
							title="Litanies"
							themeStyles={themeStyles}
							defaultOpen
							forceCollapsed={allCollapsed}
						>
							<InlinePrayer
								content={watch.litanies.content}
								textStyles={textStyles}
								isRtl={isRtl}
							/>
						</CollapsibleSection>
					</section>
				)}

				{/* Watch Closing */}
				{watch.closing && (
					<PrayerSection
						id="section-closing"
						section={watch.closing}
						defaultTitle="Closing Prayer"
						textStyles={textStyles}
						themeStyles={themeStyles}
						isRtl={isRtl}
						forceCollapsed={allCollapsed}
					/>
				)}
			</div>
		</div>
	)
}
