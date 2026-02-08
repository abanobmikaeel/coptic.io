'use client'

import {
	CATEGORIES,
	type CategoryId,
	getCategoryForEntry,
	matchesCategory,
} from '@/components/synaxarium/SynaxariumCategoryFilters'
import type { ViewMode } from '@/components/synaxarium/SynaxariumHeader'
import { getCalendarDate, getSynaxariumByDate, searchSynaxarium } from '@/lib/api'
import type { SynaxariumEntry, SynaxariumSearchResult } from '@/lib/types'
import { formatGregorianDate, getTodayDateString } from '@/lib/utils/dateFormatters'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'

export function useSynaxarium() {
	const router = useRouter()
	const searchParams = useSearchParams()

	// === URL as source of truth ===
	const dateParam = searchParams.get('date')
	const viewParam = searchParams.get('view')
	const categoryParam = searchParams.get('category')
	const entryParam = searchParams.get('entry')

	const today = getTodayDateString()
	const currentDate = dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam) ? dateParam : today
	const viewMode: ViewMode = viewParam === 'upcoming' ? 'upcoming' : 'day'
	const selectedCategory: CategoryId = (
		categoryParam && CATEGORIES.some((c) => c.id === categoryParam) ? categoryParam : 'all'
	) as CategoryId

	// === Derived from URL ===
	const isToday = currentDate === today
	const displayDate = formatGregorianDate(new Date(`${currentDate}T00:00:00`))

	// === Local UI state ===
	const [searchQuery, setSearchQuery] = useState('')
	const [expandedEntry, setExpandedEntry] = useState<number | null>(null)

	// === Fetched data ===
	const [copticDate, setCopticDate] = useState<string | null>(null)
	const [entries, setEntries] = useState<SynaxariumEntry[]>([])
	const [loading, setLoading] = useState(true)
	const [searchResults, setSearchResults] = useState<SynaxariumSearchResult[]>([])
	const [isSearching, setIsSearching] = useState(false)

	// === URL update helper ===
	const updateUrl = useCallback(
		(updates: { date?: string | null; view?: ViewMode | null; category?: CategoryId | null }) => {
			const params = new URLSearchParams(searchParams.toString())

			if ('date' in updates) {
				if (updates.date && updates.date !== today) {
					params.set('date', updates.date)
				} else {
					params.delete('date')
				}
			}
			if ('view' in updates) {
				if (updates.view === 'upcoming') {
					params.set('view', 'upcoming')
				} else {
					params.delete('view')
				}
			}
			if ('category' in updates) {
				if (updates.category && updates.category !== 'all') {
					params.set('category', updates.category)
				} else {
					params.delete('category')
				}
			}

			const query = params.toString()
			router.replace(`/synaxarium${query ? `?${query}` : ''}`, { scroll: false })
		},
		[router, searchParams, today],
	)

	// === Actions ===
	const navigateDate = useCallback(
		(days: number) => {
			const d = new Date(`${currentDate}T00:00:00`)
			d.setDate(d.getDate() + days)
			const newDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
			updateUrl({ date: newDate })
		},
		[currentDate, updateUrl],
	)

	const handleViewModeChange = useCallback(
		(mode: ViewMode) => {
			if (mode === 'day' && viewMode === 'upcoming') {
				// Clicking "Today" from upcoming goes to today
				updateUrl({ date: null, view: 'day' })
			} else {
				updateUrl({ view: mode })
			}
		},
		[viewMode, updateUrl],
	)

	const handleCategoryChange = useCallback(
		(category: CategoryId) => {
			updateUrl({ category })
		},
		[updateUrl],
	)

	// === Data fetching ===

	// Fetch Coptic date
	useEffect(() => {
		let cancelled = false
		getCalendarDate(currentDate).then((data) => {
			if (!cancelled && data) setCopticDate(data.dateString)
		})
		return () => {
			cancelled = true
		}
	}, [currentDate])

	// Fetch entries
	useEffect(() => {
		if (viewMode !== 'day') return
		let cancelled = false
		setLoading(true)
		getSynaxariumByDate(currentDate).then((data) => {
			if (!cancelled) {
				setEntries(data || [])
				setLoading(false)
			}
		})
		return () => {
			cancelled = true
		}
	}, [currentDate, viewMode])

	// Expand entry from URL param
	useEffect(() => {
		if (entryParam && entries.length > 0) {
			const idx = entries.findIndex((e) => e.name === decodeURIComponent(entryParam))
			if (idx >= 0) setExpandedEntry(idx)
		}
	}, [entryParam, entries])

	// Debounced search
	useEffect(() => {
		if (!searchQuery.trim()) {
			setSearchResults([])
			return
		}
		setIsSearching(true)
		const timer = setTimeout(async () => {
			const results = await searchSynaxarium(searchQuery)
			setSearchResults(results || [])
			setIsSearching(false)
		}, 300)
		return () => clearTimeout(timer)
	}, [searchQuery])

	// === Derived data ===
	const showingSearch = searchQuery.trim().length > 0

	const filteredEntries = useMemo(() => {
		if (selectedCategory === 'all') return entries
		return entries.filter((e) => matchesCategory(e.name, selectedCategory))
	}, [entries, selectedCategory])

	const filteredSearchResults = useMemo(() => {
		if (selectedCategory === 'all') return searchResults
		return searchResults.filter(
			(r) => r.entry.name && matchesCategory(r.entry.name, selectedCategory),
		)
	}, [searchResults, selectedCategory])

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

	return {
		// State from URL
		viewMode,
		currentDate,
		selectedCategory,
		isToday,
		displayDate,
		// Fetched data
		copticDate,
		entries,
		filteredEntries,
		loading,
		// Search
		searchQuery,
		searchResults,
		filteredSearchResults,
		isSearching,
		showingSearch,
		// UI state
		expandedEntry,
		categoryCounts,
		// Actions
		setSearchQuery,
		navigateDate,
		handleViewModeChange,
		handleCategoryChange,
	}
}
