'use client'

import { SynaxariumSection } from '@/components/SynaxariumSection'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { NoEntriesState } from '@/components/ui/EmptyState'
import { ChevronRightIcon } from '@/components/ui/Icons'
import type { SynaxariumEntry } from '@/lib/types'
import Link from 'next/link'
import {
	CATEGORIES,
	type CategoryId,
	getCategoryColor,
	getCategoryForEntry,
} from './SynaxariumCategoryFilters'

interface SynaxariumDayViewProps {
	currentDate: string
	isToday: boolean
	entries: SynaxariumEntry[]
	filteredEntries: SynaxariumEntry[]
	loading: boolean
	selectedCategory: CategoryId
	expandedEntry: number | null
}

export function SynaxariumDayView({
	currentDate,
	isToday,
	entries,
	filteredEntries,
	loading,
	selectedCategory,
	expandedEntry,
}: SynaxariumDayViewProps) {
	return (
		<>
			{/* Featured Today */}
			{isToday && entries.length > 0 && <FeaturedTodayCard entries={entries} />}

			{/* Entries List */}
			<section className="relative px-6 pb-16">
				<div className="max-w-4xl mx-auto">
					<Card>
						<CardHeader>
							{selectedCategory === 'all'
								? 'All Commemorations'
								: CATEGORIES.find((c) => c.id === selectedCategory)?.label}
							<span className="ml-2 text-sm font-normal text-gray-500">
								({filteredEntries.length})
							</span>
						</CardHeader>
						<CardContent>
							{loading ? (
								<EntriesLoadingSkeleton />
							) : filteredEntries.length > 0 ? (
								<SynaxariumSection entries={filteredEntries} initialExpanded={expandedEntry} />
							) : (
								<NoEntriesState
									type={
										selectedCategory === 'all'
											? 'commemorations'
											: CATEGORIES.find((c) => c.id === selectedCategory)?.label?.toLowerCase()
									}
								/>
							)}
						</CardContent>
					</Card>

					<div className="mt-6 text-center">
						<Link
							href={`/readings?date=${currentDate}`}
							prefetch={false}
							className="inline-flex items-center gap-2 text-amber-600 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400 font-medium transition-colors"
						>
							View readings for this date
							<ChevronRightIcon className="w-4 h-4" />
						</Link>
					</div>
				</div>
			</section>
		</>
	)
}

function FeaturedTodayCard({ entries }: { entries: SynaxariumEntry[] }) {
	return (
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
							{entries.slice(0, 4).map((entry, idx) => {
								const category = getCategoryForEntry(entry.name)
								return (
									<div
										key={idx}
										className="p-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800"
									>
										<span
											className={`inline-block px-2 py-0.5 rounded text-xs font-medium mb-2 ${getCategoryColor(category)}`}
										>
											{CATEGORIES.find((c) => c.id === category)?.label || 'Other'}
										</span>
										<p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
											{entry.name}
										</p>
									</div>
								)
							})}
						</div>
					</CardContent>
				</Card>
			</div>
		</section>
	)
}

function EntriesLoadingSkeleton() {
	return (
		<div className="space-y-4 py-4">
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
	)
}
