'use client'

import { API_BASE_URL } from '@/config'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

// Search result types matching the API
export interface BibleSearchResult {
	type: 'verse' | 'reference'
	book: string
	chapter: number
	verse?: number
	text: string
	url: string
	score?: number
}

export interface SynaxariumSearchResult {
	type: 'saint' | 'feast'
	name: string
	date: string
	copticDate: string
	summary?: string
	url: string
	score?: number
}

export interface AgpeyaSearchResult {
	type: 'hour' | 'prayer'
	id: string
	name: string
	englishName: string
	traditionalTime?: string
	url: string
	score?: number
}

export interface SearchResults {
	bible: BibleSearchResult[]
	synaxarium: SynaxariumSearchResult[]
	agpeya: AgpeyaSearchResult[]
}

export interface SearchResponse {
	results: SearchResults
	query: string
	totalCount: number
}

// Unified result type for navigation
export type SearchResultItem =
	| (BibleSearchResult & { category: 'bible' })
	| (SynaxariumSearchResult & { category: 'synaxarium' })
	| (AgpeyaSearchResult & { category: 'agpeya' })

export function useCommandPalette() {
	const [isOpen, setIsOpen] = useState(false)
	const [query, setQuery] = useState('')
	const [results, setResults] = useState<SearchResults | null>(null)
	const [isLoading, setIsLoading] = useState(false)
	const [selectedIndex, setSelectedIndex] = useState(0)
	const [error, setError] = useState<string | null>(null)

	const router = useRouter()
	const abortControllerRef = useRef<AbortController | null>(null)
	const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)

	// Flatten results for keyboard navigation (excludes Bible - no dedicated reading page)
	const flattenedResults = useCallback((): SearchResultItem[] => {
		if (!results) return []

		const items: SearchResultItem[] = []

		results.synaxarium.forEach((item) => {
			items.push({ ...item, category: 'synaxarium' })
		})

		results.agpeya.forEach((item) => {
			items.push({ ...item, category: 'agpeya' })
		})

		return items
	}, [results])

	// Open/close handlers
	const open = useCallback(() => {
		setIsOpen(true)
		setQuery('')
		setResults(null)
		setSelectedIndex(0)
		setError(null)
	}, [])

	const close = useCallback(() => {
		setIsOpen(false)
		setQuery('')
		setResults(null)
		setSelectedIndex(0)
		setError(null)

		// Cancel any pending requests
		if (abortControllerRef.current) {
			abortControllerRef.current.abort()
		}
		if (debounceTimeoutRef.current) {
			clearTimeout(debounceTimeoutRef.current)
		}
	}, [])

	// Search function with debouncing
	const search = useCallback(async (searchQuery: string) => {
		// Cancel previous request
		if (abortControllerRef.current) {
			abortControllerRef.current.abort()
		}

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

			if (!response.ok) {
				throw new Error('Search failed')
			}

			const data: SearchResponse = await response.json()
			setResults(data.results)
			setSelectedIndex(0)
		} catch (err) {
			if (err instanceof Error && err.name === 'AbortError') {
				// Request was cancelled, ignore
				return
			}
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

		if (debounceTimeoutRef.current) {
			clearTimeout(debounceTimeoutRef.current)
		}

		debounceTimeoutRef.current = setTimeout(() => {
			search(query)
		}, 200)

		return () => {
			if (debounceTimeoutRef.current) {
				clearTimeout(debounceTimeoutRef.current)
			}
		}
	}, [query, isOpen, search])

	// Navigate to selected result
	const navigateToResult = useCallback(
		(item: SearchResultItem) => {
			router.push(item.url)
			close()
		},
		[router, close],
	)

	// Select current result
	const selectCurrent = useCallback(() => {
		const items = flattenedResults()
		if (items.length > 0 && selectedIndex < items.length) {
			navigateToResult(items[selectedIndex])
		}
	}, [flattenedResults, selectedIndex, navigateToResult])

	// Keyboard navigation
	const handleKeyDown = useCallback(
		(e: KeyboardEvent) => {
			if (!isOpen) return

			const items = flattenedResults()
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
					selectCurrent()
					break
				case 'Escape':
					e.preventDefault()
					close()
					break
			}
		},
		[isOpen, flattenedResults, selectCurrent, close],
	)

	// Global keyboard shortcut (Cmd+K / Ctrl+K)
	useEffect(() => {
		const handleGlobalKeyDown = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
				e.preventDefault()
				if (isOpen) {
					close()
				} else {
					open()
				}
			}
		}

		document.addEventListener('keydown', handleGlobalKeyDown)
		return () => document.removeEventListener('keydown', handleGlobalKeyDown)
	}, [isOpen, open, close])

	// Handle keyboard navigation when open
	useEffect(() => {
		if (isOpen) {
			document.addEventListener('keydown', handleKeyDown)
			return () => document.removeEventListener('keydown', handleKeyDown)
		}
	}, [isOpen, handleKeyDown])

	return {
		isOpen,
		open,
		close,
		query,
		setQuery,
		results,
		isLoading,
		selectedIndex,
		setSelectedIndex,
		flattenedResults,
		navigateToResult,
		error,
	}
}
