'use client'

import { Breadcrumb } from '@/components/Breadcrumb'
import { SynaxariumSection } from '@/components/SynaxariumSection'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { NoEntriesState, NoResultsState } from '@/components/ui/EmptyState'
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon, SearchIcon } from '@/components/ui/Icons'
import { useSwipeGesture } from '@/hooks/useSwipeGesture'
import { getSynaxariumByDate, searchSynaxarium } from '@/lib/api'
import type { SynaxariumEntry, SynaxariumSearchResult } from '@/lib/types'
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'

const CATEGORIES = [
	{ id: 'all', label: 'All', pattern: null },
	{ id: 'martyrs', label: 'Martyrs', pattern: /martyr/i },
	{ id: 'popes', label: 'Popes', pattern: /pope|patriarch/i },
	{ id: 'apostles', label: 'Apostles', pattern: /apostle/i },
	{ id: 'departures', label: 'Departures', pattern: /departure/i },
	{ id: 'feasts', label: 'Feasts', pattern: /feast|commemoration/i },
	{
		id: 'monastics',
		label: 'Monastics',
		pattern: /monk|nun|hermit|abbot|monastery|desert father|ascetic/i,
	},
	{ id: 'bishops', label: 'Bishops', pattern: /bishop|metropolitan|archbishop/i },
] as const

type CategoryId = (typeof CATEGORIES)[number]['id']

function getTodayDateString(): string {
	const d = new Date()
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function formatDisplayDate(dateStr: string): string {
	const d = new Date(dateStr)
	return d.toLocaleDateString('en-US', {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	})
}

function addDays(dateStr: string, days: number): string {
	const d = new Date(dateStr)
	d.setDate(d.getDate() + days)
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getCategoryForEntry(name: string): CategoryId {
	for (const cat of CATEGORIES) {
		if (cat.pattern?.test(name)) {
			return cat.id
		}
	}
	return 'all'
}

function getCategoryColor(categoryId: CategoryId): string {
	const colors: Record<CategoryId, string> = {
		all: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
		martyrs: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
		popes: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
		apostles: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
		departures: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
		feasts: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
		monastics: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
		bishops: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
	}
	return colors[categoryId] || colors.all
}

export default function SynaxariumPage() {
	const [currentDate, setCurrentDate] = useState(getTodayDateString)
	const [entries, setEntries] = useState<SynaxariumEntry[]>([])
	const [searchQuery, setSearchQuery] = useState('')
	const [searchResults, setSearchResults] = useState<SynaxariumSearchResult[]>([])
	const [isSearching, setIsSearching] = useState(false)
	const [loading, setLoading] = useState(true)
	const [selectedCategory, setSelectedCategory] = useState<CategoryId>('all')

	const isToday = currentDate === getTodayDateString()

	// Fetch entries for current date
	useEffect(() => {
		let cancelled = false
		setLoading(true)

		getSynaxariumByDate(currentDate).then((data) => {
			if (!cancelled && data) {
				setEntries(data)
			}
			if (!cancelled) setLoading(false)
		})

		return () => {
			cancelled = true
		}
	}, [currentDate])

	// Debounced search
	useEffect(() => {
		if (!searchQuery.trim()) {
			setSearchResults([])
			setIsSearching(false)
			setSelectedCategory('all')
			return
		}

		setIsSearching(true)
		setSelectedCategory('all')
		const timer = setTimeout(async () => {
			const results = await searchSynaxarium(searchQuery)
			setSearchResults(results || [])
			setIsSearching(false)
		}, 300)

		return () => clearTimeout(timer)
	}, [searchQuery])

	const navigateDate = useCallback((days: number) => {
		setCurrentDate((prev) => addDays(prev, days))
		setSelectedCategory('all')
	}, [])

	const goToToday = useCallback(() => {
		setCurrentDate(getTodayDateString())
		setSelectedCategory('all')
	}, [])

	// Filter entries by category
	const filteredEntries = useMemo(() => {
		if (selectedCategory === 'all') return entries
		const category = CATEGORIES.find((c) => c.id === selectedCategory)
		const pattern = category?.pattern
		if (!pattern) return entries
		return entries.filter((e) => pattern.test(e.name))
	}, [entries, selectedCategory])

	// Filter search results by category
	const filteredSearchResults = useMemo(() => {
		if (selectedCategory === 'all') return searchResults
		const category = CATEGORIES.find((c) => c.id === selectedCategory)
		const pattern = category?.pattern
		if (!pattern) return searchResults
		return searchResults.filter((r) => r.entry.name && pattern.test(r.entry.name))
	}, [searchResults, selectedCategory])

	// Count entries per category (for date view)
	const categoryCounts = useMemo(() => {
		const counts: Record<CategoryId, number> = {
			all: entries.length,
			martyrs: 0,
			popes: 0,
			apostles: 0,
			departures: 0,
			feasts: 0,
			monastics: 0,
			bishops: 0,
		}
		for (const entry of entries) {
			const cat = getCategoryForEntry(entry.name)
			if (cat !== 'all') counts[cat]++
		}
		return counts
	}, [entries])

	// Count search results per category
	const searchCategoryCounts = useMemo(() => {
		const counts: Record<CategoryId, number> = {
			all: searchResults.length,
			martyrs: 0,
			popes: 0,
			apostles: 0,
			departures: 0,
			feasts: 0,
			monastics: 0,
			bishops: 0,
		}
		for (const result of searchResults) {
			if (result.entry.name) {
				const cat = getCategoryForEntry(result.entry.name)
				if (cat !== 'all') counts[cat]++
			}
		}
		return counts
	}, [searchResults])

	const showingSearch = searchQuery.trim().length > 0
	const activeCounts = showingSearch ? searchCategoryCounts : categoryCounts

	// Swipe gesture for mobile date navigation (only when not searching)
	const swipeRef = useSwipeGesture<HTMLElement>({
		onSwipeLeft: showingSearch ? undefined : () => navigateDate(1),
		onSwipeRight: showingSearch ? undefined : () => navigateDate(-1),
		minSwipeDistance: 75,
	})

	return (
		<main ref={swipeRef} className="min-h-screen relative">
			{/* Background */}
			<div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none">
				<div className="absolute top-20 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-amber-500/[0.03] dark:bg-amber-500/[0.05] rounded-full blur-[100px]" />
			</div>

			{/* Header */}
			<section className="relative pt-6 lg:pt-20 pb-8 px-6">
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
						<div className="w-12" /> {/* Spacer for centering */}
					</div>
					<div className="text-center">
						<h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Synaxarium</h1>
						<p className="text-gray-600 dark:text-gray-400">
							Lives of the Saints of the Coptic Orthodox Church
						</p>
					</div>
				</div>
			</section>

			{/* Search */}
			<section className="relative px-6 pb-6">
				<div className="max-w-4xl mx-auto">
					<div className="relative">
						<SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
						<input
							type="text"
							placeholder="Search saints, feasts, and commemorations..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
						/>
						{isSearching && (
							<div className="absolute right-4 top-1/2 -translate-y-1/2">
								<div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
							</div>
						)}
					</div>
				</div>
			</section>

			{/* Category Filters - shown for both search and date view */}
			<section className="relative px-6 pb-6">
				<div className="max-w-4xl mx-auto">
					<div className="flex flex-wrap gap-2">
						{CATEGORIES.map((cat) => {
							const count = activeCounts[cat.id]
							if (cat.id !== 'all' && count === 0) return null
							return (
								<button
									key={cat.id}
									type="button"
									onClick={() => setSelectedCategory(cat.id)}
									className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
										selectedCategory === cat.id
											? 'bg-amber-700 text-white'
											: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
									}`}
								>
									{cat.label}
									<span className="ml-1.5 opacity-70">({count})</span>
								</button>
							)
						})}
					</div>
				</div>
			</section>

			{/* Search Results */}
			{showingSearch ? (
				<section className="relative px-6 pb-16">
					<div className="max-w-4xl mx-auto">
						<Card>
							<CardHeader>
								Search Results
								{filteredSearchResults.length > 0 && (
									<span className="ml-2 text-sm font-normal text-gray-500">
										({filteredSearchResults.length} of {searchResults.length})
									</span>
								)}
							</CardHeader>
							<CardContent>
								{filteredSearchResults.length > 0 ? (
									<ul className="space-y-3">
										{filteredSearchResults.map((result, idx) => {
											const name = result.entry.name || 'Unknown'
											const dateUrl = result.copticDate.dateString.replace(/ /g, '-')
											const entryName = encodeURIComponent(name)
											return (
												<li
													key={idx}
													className="border-b border-gray-100 dark:border-gray-800 last:border-0 pb-3 last:pb-0"
												>
													<Link
														href={`/synaxarium/${encodeURIComponent(dateUrl)}?entry=${entryName}`}
														className="block group hover:bg-gray-50 dark:hover:bg-gray-800/50 -mx-2 px-2 py-2 rounded-lg transition-colors"
													>
														<div className="flex items-start justify-between gap-2">
															<div className="flex-1">
																<span
																	className={`inline-block px-2 py-0.5 rounded text-xs font-medium mb-1 ${getCategoryColor(getCategoryForEntry(name))}`}
																>
																	{CATEGORIES.find((c) => c.id === getCategoryForEntry(name))
																		?.label || 'Other'}
																</span>
																<h3 className="font-medium text-gray-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors">
																	{name}
																</h3>
																<p className="text-sm text-amber-600 dark:text-amber-500">
																	{result.copticDate.dateString}
																</p>
															</div>
															<ChevronRightIcon className="w-5 h-5 text-gray-400 group-hover:text-amber-600 dark:group-hover:text-amber-500 mt-1 flex-shrink-0 transition-colors" />
														</div>
													</Link>
												</li>
											)
										})}
									</ul>
								) : !isSearching ? (
									<NoResultsState
										query={searchResults.length > 0 ? undefined : searchQuery}
										onClear={searchResults.length > 0 ? undefined : () => setSearchQuery('')}
									/>
								) : null}
							</CardContent>
						</Card>
					</div>
				</section>
			) : (
				<>
					{/* Date Navigation */}
					<section className="relative px-6 pb-6">
						<div className="max-w-4xl mx-auto">
							<div className="flex items-center justify-between">
								<button
									type="button"
									onClick={() => navigateDate(-1)}
									aria-label="Previous day"
									className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
								>
									<ChevronLeftIcon />
								</button>

								<div className="flex items-center gap-3">
									{!isToday && (
										<button
											type="button"
											onClick={goToToday}
											className="px-4 py-2 text-sm font-semibold rounded-lg bg-amber-700 hover:bg-amber-600 text-white shadow-sm hover:shadow transition-all"
										>
											Today
										</button>
									)}
									<div className="text-center">
										<p className="text-lg font-semibold text-gray-900 dark:text-white">
											{formatDisplayDate(currentDate)}
										</p>
										{isToday && <p className="text-sm text-amber-600 dark:text-amber-500">Today</p>}
									</div>
								</div>

								<button
									type="button"
									onClick={() => navigateDate(1)}
									aria-label="Next day"
									className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
								>
									<ChevronRightIcon />
								</button>
							</div>
						</div>
					</section>

					{/* Featured Today Section */}
					{isToday && entries.length > 0 && (
						<section className="relative px-6 pb-6">
							<div className="max-w-4xl mx-auto">
								<Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10">
									<CardHeader className="flex items-center gap-2">
										<span className="text-amber-600 dark:text-amber-500">Today's Saints</span>
										<span className="text-sm font-normal text-gray-500 dark:text-gray-400">
											{entries.length} commemoration{entries.length !== 1 ? 's' : ''}
										</span>
									</CardHeader>
									<CardContent>
										<div className="grid gap-3 sm:grid-cols-2">
											{entries.slice(0, 4).map((entry, idx) => (
												<div
													key={idx}
													className="p-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800"
												>
													<span
														className={`inline-block px-2 py-0.5 rounded text-xs font-medium mb-2 ${getCategoryColor(getCategoryForEntry(entry.name))}`}
													>
														{CATEGORIES.find((c) => c.id === getCategoryForEntry(entry.name))
															?.label || 'Other'}
													</span>
													<p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
														{entry.name}
													</p>
												</div>
											))}
										</div>
									</CardContent>
								</Card>
							</div>
						</section>
					)}

					{/* Entries List */}
					<section className="relative px-6 pb-16">
						<div className="max-w-4xl mx-auto">
							<Card>
								<CardHeader>
									{selectedCategory === 'all'
										? 'All Commemorations'
										: `${CATEGORIES.find((c) => c.id === selectedCategory)?.label}`}
									<span className="ml-2 text-sm font-normal text-gray-500">
										({filteredEntries.length})
									</span>
								</CardHeader>
								<CardContent>
									{loading ? (
										<div className="space-y-4 py-4">
											{/* Skeleton loading state */}
											{[1, 2, 3, 4].map((i) => (
												<div
													key={i}
													className="border-b border-gray-100 dark:border-gray-800 last:border-0 pb-4 last:pb-0"
												>
													<div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
													<div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1" />
													<div className="h-4 w-1/2 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
												</div>
											))}
										</div>
									) : filteredEntries.length > 0 ? (
										<SynaxariumSection entries={filteredEntries} />
									) : (
										<NoEntriesState
											type={
												selectedCategory === 'all'
													? 'commemorations'
													: CATEGORIES.find((c) => c.id === selectedCategory)?.label.toLowerCase()
											}
										/>
									)}
								</CardContent>
							</Card>

							{/* Link to readings */}
							<div className="mt-6 text-center">
								<Link
									href={`/readings?date=${currentDate}`}
									className="inline-flex items-center gap-2 text-amber-600 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400 font-medium transition-colors"
								>
									View readings for this date
									<ChevronRightIcon className="w-4 h-4" />
								</Link>
							</div>
						</div>
					</section>
				</>
			)}
		</main>
	)
}
