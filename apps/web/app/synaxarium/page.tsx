'use client'

import { Breadcrumb } from '@/components/Breadcrumb'
import { DateNavigation } from '@/components/DateNavigation'
import { DisplaySettings } from '@/components/DisplaySettings'
import { ReadingPageLayout } from '@/components/ReadingPageLayout'
import { ReadingsHeader } from '@/components/ReadingsHeader'
import { SynaxariumCategoryFilters } from '@/components/synaxarium/SynaxariumCategoryFilters'
import { SynaxariumDayView } from '@/components/synaxarium/SynaxariumDayView'
import { SynaxariumHeader } from '@/components/synaxarium/SynaxariumHeader'
import { SynaxariumSearch } from '@/components/synaxarium/SynaxariumSearch'
import { SynaxariumSearchResults } from '@/components/synaxarium/SynaxariumSearchResults'
import { SynaxariumUpcomingView } from '@/components/synaxarium/SynaxariumUpcomingView'
import { useReadingSettings } from '@/hooks/useReadingSettings'
import { useSwipeGesture } from '@/hooks/useSwipeGesture'
import { useSynaxarium } from '@/hooks/useSynaxarium'
import { themeClasses } from '@/lib/reading-styles'
import { getTodayDateString } from '@/lib/utils/dateFormatters'
import { useTranslations } from 'next-intl'
import { Suspense } from 'react'

function SynaxariumPageContent() {
	const tNav = useTranslations('nav')
	const { settings, mounted } = useReadingSettings()

	const {
		viewMode,
		currentDate,
		copticDate,
		displayDate,
		filteredBilingualEntries,
		searchQuery,
		searchResults,
		filteredSearchResults,
		isSearching,
		loading,
		selectedCategory,
		expandedEntry,
		setExpandedEntry,
		showingSearch,
		categoryCounts,
		setSearchQuery,
		navigateDate,
		handleViewModeChange,
		handleCategoryChange,
	} = useSynaxarium()

	const swipeRef = useSwipeGesture<HTMLElement>({
		onSwipeLeft: showingSearch || viewMode !== 'day' ? undefined : () => navigateDate(1),
		onSwipeRight: showingSearch || viewMode !== 'day' ? undefined : () => navigateDate(-1),
		minSwipeDistance: 75,
	})

	const effectiveTheme = mounted ? settings.theme : 'light'

	const stickyHeader = (
		<ReadingsHeader theme={effectiveTheme} layout="between">
			<div className="flex items-center gap-2 min-w-0">
				<Breadcrumb items={[{ label: tNav('synaxarium') }]} theme={effectiveTheme} />
			</div>
			{/* Date navigation — centered, mirroring the readings page. */}
			<Suspense
				fallback={
					<span
						className={`text-sm sm:text-base font-semibold ${themeClasses.textHeading[effectiveTheme]}`}
					>
						{displayDate}
					</span>
				}
			>
				<DateNavigation theme={effectiveTheme} basePath="/synaxarium" keepDateParam>
					<div className="text-center min-w-0 px-1">
						<p
							className={`text-sm sm:text-base font-semibold truncate ${themeClasses.textHeading[effectiveTheme]}`}
						>
							{displayDate}
						</p>
						{copticDate && (
							<p className={`text-[10px] sm:text-xs ${themeClasses.muted[effectiveTheme]}`}>
								{copticDate}
							</p>
						)}
					</div>
				</DateNavigation>
			</Suspense>
			<div className="relative">
				<DisplaySettings availableLanguages={['en', 'ar']} />
			</div>
		</ReadingsHeader>
	)

	return (
		<ReadingPageLayout theme={effectiveTheme} header={stickyHeader}>
			<div ref={swipeRef as React.RefObject<HTMLDivElement>}>
				{/* View toggle (day vs upcoming) + search + category filters, just below the header. */}
				<SynaxariumHeader viewMode={viewMode} onViewModeChange={handleViewModeChange} />

				<SynaxariumSearch value={searchQuery} onChange={setSearchQuery} isSearching={isSearching} />

				<SynaxariumCategoryFilters
					selectedCategory={selectedCategory}
					onCategoryChange={handleCategoryChange}
					counts={categoryCounts}
					showCounts={viewMode === 'day' && !showingSearch}
				/>

				{showingSearch ? (
					<SynaxariumSearchResults
						results={filteredSearchResults}
						totalResults={searchResults.length}
						isSearching={isSearching}
						searchQuery={searchQuery}
						onClearSearch={() => setSearchQuery('')}
					/>
				) : viewMode === 'upcoming' ? (
					<SynaxariumUpcomingView
						startDate={getTodayDateString()}
						selectedCategory={selectedCategory}
					/>
				) : (
					<SynaxariumDayView
						key={currentDate}
						currentDate={currentDate}
						filteredBilingualEntries={filteredBilingualEntries}
						loading={loading}
						selectedCategory={selectedCategory}
						expandedEntry={expandedEntry}
						onExpandedChange={setExpandedEntry}
						textSize={settings.textSize}
						theme={settings.theme}
						fontFamily={settings.fontFamily}
						weight={settings.weight}
						lineSpacing={settings.lineSpacing}
						wordSpacing={settings.wordSpacing}
					/>
				)}
			</div>
		</ReadingPageLayout>
	)
}

export default function SynaxariumPage() {
	return (
		<Suspense
			fallback={
				<main className="min-h-screen relative">
					<div className="flex justify-center pt-40">
						<div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
					</div>
				</main>
			}
		>
			<SynaxariumPageContent />
		</Suspense>
	)
}
