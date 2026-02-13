'use client'

import type { ViewMode } from '@/lib/reading-preferences'
import { CollapsibleSection } from './CollapsibleSection'
import { GospelSection } from './GospelSection'
import { HourHeader } from './HourHeader'
import { InlinePrayer } from './InlinePrayer'
import { IntroductoryPsalmSection } from './IntroductoryPsalmSection'
import { PrayerSection } from './PrayerSection'
import { PsalmsSection } from './PsalmsSection'
import type { AgpeyaHourData, ThemeStyles } from './types'

interface StandardHourProps {
	hour: AgpeyaHourData
	textStyles: string
	verseNumClass: string
	themeStyles: ThemeStyles
	isRtl: boolean
	viewMode: ViewMode
	allCollapsed: boolean
}

export function StandardHour({
	hour,
	textStyles,
	verseNumClass,
	themeStyles,
	isRtl,
	viewMode,
	allCollapsed,
}: StandardHourProps) {
	return (
		<div>
			<HourHeader
				title={hour.name}
				subtitle={hour.englishName}
				introduction={hour.introduction}
				themeStyles={themeStyles}
			/>

			<div className="space-y-8">
				{/* Opening - always inline */}
				<section id="section-introduction" className="scroll-mt-24">
					<InlinePrayer content={hour.opening.content} textStyles={textStyles} isRtl={isRtl} />
				</section>

				{/* Thanksgiving */}
				{hour.thanksgiving && (
					<PrayerSection
						id="section-thanksgiving"
						section={hour.thanksgiving}
						defaultTitle="Thanksgiving"
						textStyles={textStyles}
						themeStyles={themeStyles}
						isRtl={isRtl}
						forceCollapsed={allCollapsed}
					/>
				)}

				{/* Introductory Psalm */}
				{hour.introductoryPsalm && (
					<IntroductoryPsalmSection
						psalm={hour.introductoryPsalm}
						textStyles={textStyles}
						verseNumClass={verseNumClass}
						themeStyles={themeStyles}
						isRtl={isRtl}
						viewMode={viewMode}
						forceCollapsed={allCollapsed}
					/>
				)}

				{/* Psalms */}
				<PsalmsSection
					psalms={hour.psalms}
					psalmsIntro={hour.psalmsIntro}
					textStyles={textStyles}
					verseNumClass={verseNumClass}
					themeStyles={themeStyles}
					isRtl={isRtl}
					viewMode={viewMode}
					forceCollapsed={allCollapsed}
				/>

				{/* Gospel */}
				<GospelSection
					gospel={hour.gospel}
					textStyles={textStyles}
					verseNumClass={verseNumClass}
					themeStyles={themeStyles}
					isRtl={isRtl}
					viewMode={viewMode}
					forceCollapsed={allCollapsed}
				/>

				{/* Litanies */}
				<section id="section-litanies" className="scroll-mt-24">
					<CollapsibleSection
						title="Litanies"
						themeStyles={themeStyles}
						defaultOpen
						forceCollapsed={allCollapsed}
					>
						<InlinePrayer content={hour.litanies.content} textStyles={textStyles} isRtl={isRtl} />
					</CollapsibleSection>
				</section>

				{/* Lord's Prayer - always inline */}
				{hour.lordsPrayer && (
					<section id="section-lords-prayer" className="scroll-mt-24">
						<InlinePrayer
							content={hour.lordsPrayer.content}
							textStyles={textStyles}
							isRtl={isRtl}
						/>
					</section>
				)}

				{/* Thanksgiving After */}
				{hour.thanksgivingAfter && (
					<PrayerSection
						id="section-thanksgiving-after"
						section={hour.thanksgivingAfter}
						defaultTitle="Prayer of Thanksgiving"
						textStyles={textStyles}
						themeStyles={themeStyles}
						isRtl={isRtl}
						forceCollapsed={allCollapsed}
					/>
				)}

				{/* Closing */}
				<PrayerSection
					id="section-closing"
					section={hour.closing}
					defaultTitle="Closing Prayer"
					textStyles={textStyles}
					themeStyles={themeStyles}
					isRtl={isRtl}
					forceCollapsed={allCollapsed}
				/>
			</div>
		</div>
	)
}
