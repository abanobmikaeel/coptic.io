'use client'

import { Breadcrumb } from '@/components/Breadcrumb'
import { SynaxariumCategoryFilters } from '@/components/synaxarium/SynaxariumCategoryFilters'
import { SynaxariumHeader } from '@/components/synaxarium/SynaxariumHeader'
import { SynaxariumSearch } from '@/components/synaxarium/SynaxariumSearch'
import { SynaxariumSearchResults } from '@/components/synaxarium/SynaxariumSearchResults'
import { SynaxariumDayView } from '@/components/synaxarium/SynaxariumDayView'
import { SynaxariumUpcomingView } from '@/components/synaxarium/SynaxariumUpcomingView'
import { CloseIcon } from '@/components/ui/Icons'
import { useSynaxarium } from '@/hooks/useSynaxarium'
import { useSwipeGesture } from '@/hooks/useSwipeGesture'
import { getTodayDateString } from '@/lib/utils/dateFormatters'
import Link from 'next/link'
import { Suspense } from 'react'

function SynaxariumPageContent() {
	const {
		viewMode, currentDate, copticDate, displayDate, entries, filteredEntries,
		searchQuery, searchResults, filteredSearchResults, isSearching,
		loading, selectedCategory, expandedEntry, isToday, showingSearch, categoryCounts,
		setSearchQuery, navigateDate, handleViewModeChange, handleCategoryChange,
	} = useSynaxarium()

	const swipeRef = useSwipeGesture<HTMLElement>({
		onSwipeLeft: showingSearch || viewMode !== 'day' ? undefined : () => navigateDate(1),
		onSwipeRight: showingSearch || viewMode !== 'day' ? undefined : () => navigateDate(-1),
		minSwipeDistance: 75,
	})

	return (
		<main ref={swipeRef} className="min-h-screen relative">
			<div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none">
				<div className="absolute top-20 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-amber-500/[0.03] dark:bg-amber-500/[0.05] rounded-full blur-[100px]" />
			</div>

			<section className="relative pt-6 lg:pt-20 pb-6 px-6">
				<div className="max-w-4xl mx-auto">
					<div className="flex items-center justify-between mb-4">
						<Link
							href="/library"
							className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
						>
							<CloseIcon className="w-4 h-4" />
							<span className="hidden sm:inline">Back</span>
						</Link>
						<Breadcrumb items={[{ label: 'Synaxarium' }]} />
						<div className="w-12" />
					</div>
					<div className="text-center">
						<h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Synaxarium</h1>
						<p className="text-gray-600 dark:text-gray-400">Lives of the Saints of the Coptic Orthodox Church</p>
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
				<SynaxariumUpcomingView startDate={getTodayDateString()} selectedCategory={selectedCategory} />
			) : (
				<SynaxariumDayView
					key={currentDate}
					currentDate={currentDate}
					isToday={isToday}
					entries={entries}
					filteredEntries={filteredEntries}
					loading={loading}
					selectedCategory={selectedCategory}
					expandedEntry={expandedEntry}
				/>
			)}
		</main>
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
