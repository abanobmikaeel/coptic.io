'use client'

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import {
	type AgpeyaSearchResult,
	type BibleSearchResult,
	type SearchResultItem,
	type SynaxariumSearchResult,
	useCommandPalette,
} from './useCommandPalette'

// Icons for different result types
function BibleIcon() {
	return (
		<svg
			className="w-4 h-4"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
			aria-hidden="true"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={1.5}
				d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
			/>
		</svg>
	)
}

function SaintIcon() {
	return (
		<svg
			className="w-4 h-4"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
			aria-hidden="true"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={1.5}
				d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
			/>
		</svg>
	)
}

function PrayerIcon() {
	return (
		<svg
			className="w-4 h-4"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
			aria-hidden="true"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={1.5}
				d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
			/>
		</svg>
	)
}

function SearchIcon() {
	return (
		<svg
			className="w-5 h-5"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
			aria-hidden="true"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
			/>
		</svg>
	)
}

function LoadingSpinner() {
	return (
		<svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
			<circle
				className="opacity-25"
				cx="12"
				cy="12"
				r="10"
				stroke="currentColor"
				strokeWidth="4"
				fill="none"
			/>
			<path
				className="opacity-75"
				fill="currentColor"
				d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
			/>
		</svg>
	)
}

// Result item component
function ResultItem({
	item,
	isSelected,
	onClick,
}: {
	item: SearchResultItem
	isSelected: boolean
	onClick: () => void
}) {
	const ref = useRef<HTMLButtonElement>(null)

	// Scroll into view when selected
	useEffect(() => {
		if (isSelected && ref.current) {
			ref.current.scrollIntoView({ block: 'nearest' })
		}
	}, [isSelected])

	const getIcon = () => {
		switch (item.category) {
			case 'bible':
				return <BibleIcon />
			case 'synaxarium':
				return <SaintIcon />
			case 'agpeya':
				return <PrayerIcon />
		}
	}

	const getTitle = () => {
		switch (item.category) {
			case 'bible': {
				const bible = item as BibleSearchResult & { category: 'bible' }
				if (bible.verse) {
					return `${bible.book} ${bible.chapter}:${bible.verse}`
				}
				return `${bible.book} ${bible.chapter}`
			}
			case 'synaxarium': {
				const synax = item as SynaxariumSearchResult & { category: 'synaxarium' }
				return synax.name
			}
			case 'agpeya': {
				const agpeya = item as AgpeyaSearchResult & { category: 'agpeya' }
				return agpeya.name
			}
		}
	}

	const getSubtitle = () => {
		switch (item.category) {
			case 'bible': {
				const bible = item as BibleSearchResult & { category: 'bible' }
				return bible.text
			}
			case 'synaxarium': {
				const synax = item as SynaxariumSearchResult & { category: 'synaxarium' }
				return synax.copticDate
			}
			case 'agpeya': {
				const agpeya = item as AgpeyaSearchResult & { category: 'agpeya' }
				return agpeya.traditionalTime
					? `${agpeya.englishName} - ${agpeya.traditionalTime}`
					: agpeya.englishName
			}
		}
	}

	const getCategoryLabel = () => {
		switch (item.category) {
			case 'bible':
				return 'Bible'
			case 'synaxarium':
				return 'Synaxarium'
			case 'agpeya':
				return 'Agpeya'
		}
	}

	return (
		<button
			ref={ref}
			type="button"
			onClick={onClick}
			className={`w-full px-4 py-3 flex items-start gap-3 text-left transition-colors ${
				isSelected
					? 'bg-amber-50 dark:bg-amber-900/20'
					: 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
			}`}
		>
			<span
				className={`mt-0.5 ${
					isSelected ? 'text-amber-600 dark:text-amber-400' : 'text-gray-400 dark:text-gray-500'
				}`}
			>
				{getIcon()}
			</span>
			<div className="flex-1 min-w-0">
				<div className="flex items-center gap-2">
					<span
						className={`font-medium truncate ${
							isSelected ? 'text-amber-900 dark:text-amber-100' : 'text-gray-900 dark:text-gray-100'
						}`}
					>
						{getTitle()}
					</span>
					<span className="text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
						{getCategoryLabel()}
					</span>
				</div>
				<p className="text-sm text-gray-500 dark:text-gray-400 truncate">{getSubtitle()}</p>
			</div>
		</button>
	)
}

// Category header
function CategoryHeader({ title }: { title: string }) {
	return (
		<div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
			{title}
		</div>
	)
}

// Main CommandPalette component
export function CommandPalette() {
	const {
		isOpen,
		close,
		query,
		setQuery,
		results,
		isLoading,
		selectedIndex,
		flattenedResults,
		navigateToResult,
		error,
	} = useCommandPalette()

	const inputRef = useRef<HTMLInputElement>(null)
	const items = flattenedResults()

	// Focus input when opened
	useEffect(() => {
		if (isOpen && inputRef.current) {
			inputRef.current.focus()
		}
	}, [isOpen])

	// Prevent body scroll when open
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = 'hidden'
		} else {
			document.body.style.overflow = ''
		}
		return () => {
			document.body.style.overflow = ''
		}
	}, [isOpen])

	if (!isOpen) return null

	// Group results by category for display
	const hasResults = results && items.length > 0
	const hasNoResults = results && items.length === 0 && query.trim()

	const content = (
		<div className="fixed inset-0 z-[100]">
			{/* Backdrop */}
			<div
				className="absolute inset-0 bg-black/50 backdrop-blur-sm"
				onClick={close}
				onKeyDown={(e) => e.key === 'Escape' && close()}
			/>

			{/* Modal */}
			<div className="absolute left-1/2 top-[20%] -translate-x-1/2 w-full max-w-xl">
				<div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
					{/* Search input */}
					<div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
						<span className="text-gray-400 dark:text-gray-500">
							{isLoading ? <LoadingSpinner /> : <SearchIcon />}
						</span>
						<input
							ref={inputRef}
							type="text"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder="Search Synaxarium, Agpeya..."
							className="flex-1 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none text-base"
						/>
						<kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 rounded">
							ESC
						</kbd>
					</div>

					{/* Results */}
					<div className="max-h-[60vh] overflow-y-auto">
						{error && (
							<div className="px-4 py-8 text-center text-red-500 dark:text-red-400">{error}</div>
						)}

						{!query.trim() && !error && (
							<div className="px-4 py-8 text-center text-gray-400 dark:text-gray-500">
								<p>Type to search across all content</p>
								<p className="text-sm mt-2">
									Try &quot;St. Mark&quot;, &quot;Prime&quot;, or &quot;Martyrs&quot;
								</p>
							</div>
						)}

						{hasNoResults && (
							<div className="px-4 py-8 text-center text-gray-400 dark:text-gray-500">
								No results found for &quot;{query}&quot;
							</div>
						)}

						{hasResults && (
							<>
								{results.synaxarium.length > 0 && (
									<>
										<CategoryHeader title="Synaxarium" />
										{results.synaxarium.map((item, i) => {
											const globalIndex = i
											return (
												<ResultItem
													key={`synax-${item.url}`}
													item={{ ...item, category: 'synaxarium' }}
													isSelected={selectedIndex === globalIndex}
													onClick={() => navigateToResult({ ...item, category: 'synaxarium' })}
												/>
											)
										})}
									</>
								)}

								{results.agpeya.length > 0 && (
									<>
										<CategoryHeader title="Agpeya" />
										{results.agpeya.map((item, i) => {
											const globalIndex = results.synaxarium.length + i
											return (
												<ResultItem
													key={`agpeya-${item.id}`}
													item={{ ...item, category: 'agpeya' }}
													isSelected={selectedIndex === globalIndex}
													onClick={() => navigateToResult({ ...item, category: 'agpeya' })}
												/>
											)
										})}
									</>
								)}
							</>
						)}
					</div>

					{/* Footer */}
					<div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
						<div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
							<div className="flex items-center gap-3">
								<span className="flex items-center gap-1">
									<kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-[10px]">
										↑↓
									</kbd>
									<span>Navigate</span>
								</span>
								<span className="flex items-center gap-1">
									<kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-[10px]">
										↵
									</kbd>
									<span>Select</span>
								</span>
							</div>
							<span className="flex items-center gap-1">
								<kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-[10px]">
									⌘K
								</kbd>
								<span>Toggle</span>
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	)

	// Use portal to render at document root
	if (typeof window === 'undefined') return null
	return createPortal(content, document.body)
}

// Export a context provider version for global state
export { useCommandPalette }
