'use client'

import { Breadcrumb } from '@/components/Breadcrumb'
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
	const t = useTranslations('synaxarium')
	const tNav = useTranslations('nav')
	const { settings, mounted } = useReadingSettings()

	const {
		viewMode,
		currentDate,
		copticDate,
		displayDate,
		bilingualEntries,
		filteredBilingualEntries,
		searchQuery,
		searchResults,
		filteredSearchResults,
		isSearching,
		loading,
		selectedCategory,
		expandedEntry,
		setExpandedEntry,
		isToday,
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
			<Breadcrumb items={[{ label: tNav('synaxarium') }]} theme={effectiveTheme} />
			<DisplaySettings />
		</ReadingsHeader>
	)

	return (
		<ReadingPageLayout
			theme={effectiveTheme}
			header={stickyHeader}
			className={`relative ${!mounted ? '!bg-transparent' : ''}`}
		>
			<div ref={swipeRef as React.RefObject<HTMLDivElement>}>
				{/* Atmospheric background glow */}
				<div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[500px] pointer-events-none overflow-hidden">
					<div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-amber-500/[0.06] via-amber-600/[0.03] to-transparent dark:from-amber-500/[0.08] dark:via-amber-600/[0.04] rounded-full blur-[120px]" />
				</div>

				<section className="relative pt-4 lg:pt-20 pb-4 lg:pb-8 px-6">
					<div className="max-w-4xl mx-auto">
						<div className="text-center">
							{/* Decorative cross */}
							<div className="flex items-center justify-center gap-4 mb-6">
								<div
									className={`h-px w-12 ${effectiveTheme === 'dark' ? 'bg-gradient-to-r from-transparent to-amber-600/40' : 'bg-gradient-to-r from-transparent to-amber-700/30'}`}
								/>
								<span className="text-amber-600 dark:text-amber-500 text-xl">✦</span>
								<div
									className={`h-px w-12 ${effectiveTheme === 'dark' ? 'bg-gradient-to-l from-transparent to-amber-600/40' : 'bg-gradient-to-l from-transparent to-amber-700/30'}`}
								/>
							</div>
							<h1 className="font-serif text-4xl lg:text-5xl font-medium tracking-tight mb-3 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-700 dark:from-white dark:via-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
								{t('title')}
							</h1>
							<p className={`text-base lg:text-lg ${themeClasses.muted[effectiveTheme]}`}>
								{t('subtitle')}
							</p>
						</div>
					</div>
				</section>

				<SynaxariumHeader
					viewMode={viewMode}
					gregorianDate={displayDate}
					copticDate={copticDate ?? undefined}
					isToday={isToday}
					onViewModeChange={handleViewModeChange}
					onPrevious={() => navigateDate(-1)}
					onNext={() => navigateDate(1)}
				/>

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
						isToday={isToday}
						bilingualEntries={bilingualEntries}
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
