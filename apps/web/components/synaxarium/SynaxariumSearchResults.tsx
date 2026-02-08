'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { NoResultsState } from '@/components/ui/EmptyState'
import { ChevronRightIcon } from '@/components/ui/Icons'
import type { SynaxariumSearchResult } from '@/lib/types'
import Link from 'next/link'
import { CATEGORIES, getCategoryColor, getCategoryForEntry } from './SynaxariumCategoryFilters'

interface SynaxariumSearchResultsProps {
	results: SynaxariumSearchResult[]
	totalResults: number
	isSearching: boolean
	searchQuery: string
	onClearSearch: () => void
}

export function SynaxariumSearchResults({
	results,
	totalResults,
	isSearching,
	searchQuery,
	onClearSearch,
}: SynaxariumSearchResultsProps) {
	return (
		<section className="relative px-6 pb-16">
			<div className="max-w-4xl mx-auto">
				<Card>
					<CardHeader>
						Search Results
						{results.length > 0 && (
							<span className="ml-2 text-sm font-normal text-gray-500">
								({results.length} of {totalResults})
							</span>
						)}
					</CardHeader>
					<CardContent>
						{results.length > 0 ? (
							<ul className="space-y-3">
								{results.map((result, idx) => {
									const name = result.entry.name || 'Unknown'
									const dateUrl = result.copticDate.dateString.replace(/ /g, '-')
									const category = getCategoryForEntry(name)
									return (
										<li
											key={idx}
											className="border-b border-gray-100 dark:border-gray-800 last:border-0 pb-3 last:pb-0"
										>
											<Link
												href={`/synaxarium/${encodeURIComponent(dateUrl)}?entry=${encodeURIComponent(name)}`}
												className="block group hover:bg-gray-50 dark:hover:bg-gray-800/50 -mx-2 px-2 py-2 rounded-lg transition-colors"
											>
												<div className="flex items-start justify-between gap-2">
													<div className="flex-1">
														<span
															className={`inline-block px-2 py-0.5 rounded text-xs font-medium mb-1 ${getCategoryColor(category)}`}
														>
															{CATEGORIES.find((c) => c.id === category)?.label || 'Other'}
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
								query={totalResults > 0 ? undefined : searchQuery}
								onClear={totalResults > 0 ? undefined : onClearSearch}
							/>
						) : null}
					</CardContent>
				</Card>
			</div>
		</section>
	)
}
