'use client'

import { API_BASE_URL } from '@/config'
import { BookIcon, ClockIcon, LoadingSpinner, PersonIcon, SearchIcon } from '@/components/ui/Icons'
import { useRouter } from 'next/navigation'
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { RemoveScroll } from 'react-remove-scroll'
import type {
	AgpeyaSearchResult,
	BibleSearchResult,
	SearchResponse,
	SearchResultItem,
	SearchResults,
	SynaxariumSearchResult,
} from './useCommandPalette'

interface CommandPaletteContextType {
	isOpen: boolean
	open: () => void
	close: () => void
}

const CommandPaletteContext = createContext<CommandPaletteContextType | null>(null)

export function useCommandPaletteContext() {
	const context = useContext(CommandPaletteContext)
	if (!context) {
		throw new Error('useCommandPaletteContext must be used within CommandPaletteProvider')
	}
	return context
}

// Modal content component
function CommandPaletteModal({
	isOpen,
	close,
}: {
	isOpen: boolean
	close: () => void
}) {
	const [query, setQuery] = useState('')
	const [results, setResults] = useState<SearchResults | null>(null)
	const [isLoading, setIsLoading] = useState(false)
	const [selectedIndex, setSelectedIndex] = useState(0)
	const [error, setError] = useState<string | null>(null)
	const [mounted, setMounted] = useState(false)

	const router = useRouter()
	const inputRef = useRef<HTMLInputElement>(null)
	const abortControllerRef = useRef<AbortController | null>(null)
	const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)

	// Track mount state for portal
	useEffect(() => {
		setMounted(true)
	}, [])

	// Flatten results for navigation (excludes Bible - no dedicated reading page)
	const flattenedResults = useCallback((): SearchResultItem[] => {
		if (!results) return []
		const items: SearchResultItem[] = []
		results.synaxarium.forEach((item) => items.push({ ...item, category: 'synaxarium' }))
		results.agpeya.forEach((item) => items.push({ ...item, category: 'agpeya' }))
		return items
	}, [results])

	const items = flattenedResults()

	// Reset state when closing
	useEffect(() => {
		if (!isOpen) {
			setQuery('')
			setResults(null)
			setSelectedIndex(0)
			setError(null)
			if (abortControllerRef.current) abortControllerRef.current.abort()
			if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current)
		}
	}, [isOpen])

	// Focus input when opened
	useEffect(() => {
		if (isOpen && inputRef.current) {
			inputRef.current.focus()
		}
	}, [isOpen])

	// Search function
	const search = useCallback(async (searchQuery: string) => {
		if (abortControllerRef.current) abortControllerRef.current.abort()

		if (!searchQuery.trim()) {
			setResults(null)
			setIsLoading(false)
			return
		}

		setIsLoading(true)
		setError(null)

		const controller = new AbortController()
		abortControllerRef.current = controller

		try {
			const response = await fetch(
				`${API_BASE_URL}/search?q=${encodeURIComponent(searchQuery)}&limit=5`,
				{ signal: controller.signal },
			)

			if (!response.ok) throw new Error('Search failed')

			const data: SearchResponse = await response.json()
			setResults(data.results)
			setSelectedIndex(0)
		} catch (err) {
			if (err instanceof Error && err.name === 'AbortError') return
			console.error('Search error:', err)
			setError('Search failed. Please try again.')
			setResults(null)
		} finally {
			setIsLoading(false)
		}
	}, [])

	// Debounced search on query change
	useEffect(() => {
		if (!isOpen) return

		if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current)

		debounceTimeoutRef.current = setTimeout(() => {
			search(query)
		}, 200)

		return () => {
			if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current)
		}
	}, [query, isOpen, search])

	// Navigate to result
	const navigateToResult = useCallback(
		(item: SearchResultItem) => {
			router.push(item.url)
			close()
		},
		[router, close],
	)

	// Keyboard handling
	useEffect(() => {
		if (!isOpen) return

		const handleKeyDown = (e: KeyboardEvent) => {
			const itemCount = items.length

			switch (e.key) {
				case 'ArrowDown':
					e.preventDefault()
					setSelectedIndex((prev) => (prev + 1) % Math.max(itemCount, 1))
					break
				case 'ArrowUp':
					e.preventDefault()
					setSelectedIndex((prev) => (prev - 1 + Math.max(itemCount, 1)) % Math.max(itemCount, 1))
					break
				case 'Enter':
					e.preventDefault()
					if (items.length > 0 && selectedIndex < items.length) {
						navigateToResult(items[selectedIndex])
					}
					break
				case 'Escape':
					e.preventDefault()
					close()
					break
			}
		}

		document.addEventListener('keydown', handleKeyDown)
		return () => document.removeEventListener('keydown', handleKeyDown)
	}, [isOpen, items, selectedIndex, navigateToResult, close])

	if (!mounted || !isOpen) return null

	const hasResults = results && items.length > 0
	const hasNoResults = results && items.length === 0 && query.trim()

	const getIcon = (category: string) => {
		switch (category) {
			case 'bible':
				return <BookIcon className="w-4 h-4" />
			case 'synaxarium':
				return <PersonIcon className="w-4 h-4" />
			case 'agpeya':
				return <ClockIcon className="w-4 h-4" />
		}
	}

	const _getTitle = (item: SearchResultItem) => {
		switch (item.category) {
			case 'bible': {
				const bible = item as BibleSearchResult & { category: 'bible' }
				return bible.verse
					? `${bible.book} ${bible.chapter}:${bible.verse}`
					: `${bible.book} ${bible.chapter}`
			}
			case 'synaxarium':
				return (item as SynaxariumSearchResult & { category: 'synaxarium' }).name
			case 'agpeya':
				return (item as AgpeyaSearchResult & { category: 'agpeya' }).name
		}
	}

	const _getSubtitle = (item: SearchResultItem) => {
		switch (item.category) {
			case 'bible':
				return (item as BibleSearchResult & { category: 'bible' }).text
			case 'synaxarium':
				return (item as SynaxariumSearchResult & { category: 'synaxarium' }).copticDate
			case 'agpeya': {
				const agpeya = item as AgpeyaSearchResult & { category: 'agpeya' }
				return agpeya.traditionalTime
					? `${agpeya.englishName} - ${agpeya.traditionalTime}`
					: agpeya.englishName
			}
		}
	}

	const getCategoryLabel = (category: string) => {
		switch (category) {
			case 'bible':
				return 'Bible'
			case 'synaxarium':
				return 'Synaxarium'
			case 'agpeya':
				return 'Agpeya'
		}
	}

	const content = (
		<RemoveScroll>
			<div className="fixed inset-0 z-[100]">
				{/* Backdrop */}
				<div
					className="absolute inset-0 bg-black/50 backdrop-blur-sm"
					onClick={close}
					onKeyDown={(e) => e.key === 'Escape' && close()}
					role="button"
					tabIndex={-1}
					aria-label="Close search"
				/>

				{/* Modal */}
				<div className="absolute left-1/2 top-[20%] -translate-x-1/2 w-full max-w-xl px-4">
					<div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
						{/* Search input */}
						<div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
							<span className="text-gray-400 dark:text-gray-500">
								{isLoading ? (
									<LoadingSpinner className="w-5 h-5" />
								) : (
									<SearchIcon className="w-5 h-5" />
								)}
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
										<div>
											<div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
												Synaxarium
											</div>
											{results.synaxarium.map((item, i) => {
												const globalIndex = i
												return (
													<button
														key={`synax-${item.url}`}
														type="button"
														onClick={() => navigateToResult({ ...item, category: 'synaxarium' })}
														className={`w-full px-4 py-3 flex items-start gap-3 text-left transition-colors ${
															selectedIndex === globalIndex
																? 'bg-amber-50 dark:bg-amber-900/20'
																: 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
														}`}
													>
														<span
															className={`mt-0.5 ${selectedIndex === globalIndex ? 'text-amber-600 dark:text-amber-400' : 'text-gray-400 dark:text-gray-500'}`}
														>
															{getIcon('synaxarium')}
														</span>
														<div className="flex-1 min-w-0">
															<div className="flex items-center gap-2">
																<span
																	className={`font-medium truncate ${selectedIndex === globalIndex ? 'text-amber-900 dark:text-amber-100' : 'text-gray-900 dark:text-gray-100'}`}
																>
																	{item.name}
																</span>
																<span className="text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
																	{getCategoryLabel('synaxarium')}
																</span>
															</div>
															<p className="text-sm text-gray-500 dark:text-gray-400 truncate">
																{item.copticDate}
															</p>
														</div>
													</button>
												)
											})}
										</div>
									)}

									{results.agpeya.length > 0 && (
										<div>
											<div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
												Agpeya
											</div>
											{results.agpeya.map((item, i) => {
												const globalIndex = results.synaxarium.length + i
												return (
													<button
														key={`agpeya-${item.id}`}
														type="button"
														onClick={() => navigateToResult({ ...item, category: 'agpeya' })}
														className={`w-full px-4 py-3 flex items-start gap-3 text-left transition-colors ${
															selectedIndex === globalIndex
																? 'bg-amber-50 dark:bg-amber-900/20'
																: 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
														}`}
													>
														<span
															className={`mt-0.5 ${selectedIndex === globalIndex ? 'text-amber-600 dark:text-amber-400' : 'text-gray-400 dark:text-gray-500'}`}
														>
															{getIcon('agpeya')}
														</span>
														<div className="flex-1 min-w-0">
															<div className="flex items-center gap-2">
																<span
																	className={`font-medium truncate ${selectedIndex === globalIndex ? 'text-amber-900 dark:text-amber-100' : 'text-gray-900 dark:text-gray-100'}`}
																>
																	{item.name}
																</span>
																<span className="text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
																	{getCategoryLabel('agpeya')}
																</span>
															</div>
															<p className="text-sm text-gray-500 dark:text-gray-400 truncate">
																{item.traditionalTime
																	? `${item.englishName} - ${item.traditionalTime}`
																	: item.englishName}
															</p>
														</div>
													</button>
												)
											})}
										</div>
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
		</RemoveScroll>
	)

	return createPortal(content, document.body)
}

export function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
	const [isOpen, setIsOpen] = useState(false)

	const open = useCallback(() => setIsOpen(true), [])
	const close = useCallback(() => setIsOpen(false), [])

	// Global Cmd+K / Ctrl+K handler
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
				e.preventDefault()
				setIsOpen((prev) => !prev)
			}
		}

		document.addEventListener('keydown', handleKeyDown)
		return () => document.removeEventListener('keydown', handleKeyDown)
	}, [])

	return (
		<CommandPaletteContext.Provider value={{ isOpen, open, close }}>
			{children}
			<CommandPaletteModal isOpen={isOpen} close={close} />
		</CommandPaletteContext.Provider>
	)
}
