'use client'

import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createPortal } from 'react-dom'
import { API_BASE_URL } from '@/config'
import type {
	SearchResults,
	SearchResponse,
	SearchResultItem,
	BibleSearchResult,
	SynaxariumSearchResult,
	AgpeyaSearchResult,
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

// Icons
function SearchIcon({ className }: { className?: string }) {
	return (
		<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
			/>
		</svg>
	)
}

function LoadingSpinner({ className }: { className?: string }) {
	return (
		<svg className={`animate-spin ${className}`} viewBox="0 0 24 24">
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

function BibleIcon() {
	return (
		<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
		<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
		<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={1.5}
				d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
			/>
		</svg>
	)
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

	// Flatten results for navigation
	const flattenedResults = useCallback((): SearchResultItem[] => {
		if (!results) return []
		const items: SearchResultItem[] = []
		results.bible.forEach((item) => items.push({ ...item, category: 'bible' }))
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
				return <BibleIcon />
			case 'synaxarium':
				return <SaintIcon />
			case 'agpeya':
				return <PrayerIcon />
		}
	}

	const getTitle = (item: SearchResultItem) => {
		switch (item.category) {
			case 'bible': {
				const bible = item as BibleSearchResult & { category: 'bible' }
				return bible.verse ? `${bible.book} ${bible.chapter}:${bible.verse}` : `${bible.book} ${bible.chapter}`
			}
			case 'synaxarium':
				return (item as SynaxariumSearchResult & { category: 'synaxarium' }).name
			case 'agpeya':
				return (item as AgpeyaSearchResult & { category: 'agpeya' }).name
		}
	}

	const getSubtitle = (item: SearchResultItem) => {
		switch (item.category) {
			case 'bible':
				return (item as BibleSearchResult & { category: 'bible' }).text
			case 'synaxarium':
				return (item as SynaxariumSearchResult & { category: 'synaxarium' }).copticDate
			case 'agpeya': {
				const agpeya = item as AgpeyaSearchResult & { category: 'agpeya' }
				return agpeya.traditionalTime ? `${agpeya.englishName} - ${agpeya.traditionalTime}` : agpeya.englishName
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
		<div className="fixed inset-0 z-[100]">
			{/* Backdrop */}
			<div
				className="absolute inset-0 bg-black/50 backdrop-blur-sm"
				onClick={close}
			/>

			{/* Modal */}
			<div className="absolute left-1/2 top-[20%] -translate-x-1/2 w-full max-w-xl px-4">
				<div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
					{/* Search input */}
					<div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
						<span className="text-gray-400 dark:text-gray-500">
							{isLoading ? <LoadingSpinner className="w-5 h-5" /> : <SearchIcon className="w-5 h-5" />}
						</span>
						<input
							ref={inputRef}
							type="text"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder="Search Bible, Synaxarium, Agpeya..."
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
									Try &quot;John 3:16&quot;, &quot;St. Mark&quot;, or &quot;Prime&quot;
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
								{results.bible.length > 0 && (
									<div>
										<div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
											Bible
										</div>
										{results.bible.map((item, i) => (
											<button
												key={`bible-${item.url}`}
												type="button"
												onClick={() => navigateToResult({ ...item, category: 'bible' })}
												className={`w-full px-4 py-3 flex items-start gap-3 text-left transition-colors ${
													selectedIndex === i
														? 'bg-amber-50 dark:bg-amber-900/20'
														: 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
												}`}
											>
												<span className={`mt-0.5 ${selectedIndex === i ? 'text-amber-600 dark:text-amber-400' : 'text-gray-400 dark:text-gray-500'}`}>
													{getIcon('bible')}
												</span>
												<div className="flex-1 min-w-0">
													<div className="flex items-center gap-2">
														<span className={`font-medium truncate ${selectedIndex === i ? 'text-amber-900 dark:text-amber-100' : 'text-gray-900 dark:text-gray-100'}`}>
															{getTitle({ ...item, category: 'bible' })}
														</span>
														<span className="text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
															{getCategoryLabel('bible')}
														</span>
													</div>
													<p className="text-sm text-gray-500 dark:text-gray-400 truncate">{item.text}</p>
												</div>
											</button>
										))}
									</div>
								)}

								{results.synaxarium.length > 0 && (
									<div>
										<div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
											Synaxarium
										</div>
										{results.synaxarium.map((item, i) => {
											const globalIndex = results.bible.length + i
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
													<span className={`mt-0.5 ${selectedIndex === globalIndex ? 'text-amber-600 dark:text-amber-400' : 'text-gray-400 dark:text-gray-500'}`}>
														{getIcon('synaxarium')}
													</span>
													<div className="flex-1 min-w-0">
														<div className="flex items-center gap-2">
															<span className={`font-medium truncate ${selectedIndex === globalIndex ? 'text-amber-900 dark:text-amber-100' : 'text-gray-900 dark:text-gray-100'}`}>
																{item.name}
															</span>
															<span className="text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
																{getCategoryLabel('synaxarium')}
															</span>
														</div>
														<p className="text-sm text-gray-500 dark:text-gray-400 truncate">{item.copticDate}</p>
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
											const globalIndex = results.bible.length + results.synaxarium.length + i
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
													<span className={`mt-0.5 ${selectedIndex === globalIndex ? 'text-amber-600 dark:text-amber-400' : 'text-gray-400 dark:text-gray-500'}`}>
														{getIcon('agpeya')}
													</span>
													<div className="flex-1 min-w-0">
														<div className="flex items-center gap-2">
															<span className={`font-medium truncate ${selectedIndex === globalIndex ? 'text-amber-900 dark:text-amber-100' : 'text-gray-900 dark:text-gray-100'}`}>
																{item.name}
															</span>
															<span className="text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
																{getCategoryLabel('agpeya')}
															</span>
														</div>
														<p className="text-sm text-gray-500 dark:text-gray-400 truncate">
															{item.traditionalTime ? `${item.englishName} - ${item.traditionalTime}` : item.englishName}
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
									<kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-[10px]">↑↓</kbd>
									<span>Navigate</span>
								</span>
								<span className="flex items-center gap-1">
									<kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-[10px]">↵</kbd>
									<span>Select</span>
								</span>
							</div>
							<span className="flex items-center gap-1">
								<kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-[10px]">⌘K</kbd>
								<span>Toggle</span>
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
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
