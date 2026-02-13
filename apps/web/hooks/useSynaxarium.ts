'use client'

import {
	CATEGORIES,
	type CategoryId,
	getCategoryForEntry,
	matchesCategory,
} from '@/components/synaxarium/SynaxariumCategoryFilters'
import { getCalendarDate, getSynaxariumByDate, searchSynaxarium } from '@/lib/api'
import type { SynaxariumViewMode } from '@/lib/reading-preferences'
import type { SynaxariumEntry, SynaxariumSearchResult } from '@/lib/types'
import { formatGregorianDate, getTodayDateString } from '@/lib/utils/dateFormatters'
import { useLocale } from 'next-intl'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'

export interface BilingualEntry {
	id: string
	en?: SynaxariumEntry
	ar?: SynaxariumEntry
}

// Merge English and Arabic entries by ID
function mergeEntriesById(
	enEntries: SynaxariumEntry[],
	arEntries: SynaxariumEntry[],
): BilingualEntry[] {
	const mergedMap = new Map<string, BilingualEntry>()
	const orderKeys: string[] = []

	// Add English entries first (primary order)
	for (const entry of enEntries) {
		const id = entry.id || `fallback-en-${entry.name.slice(0, 30)}`
		if (!mergedMap.has(id)) {
			mergedMap.set(id, { id })
			orderKeys.push(id)
		}
		mergedMap.get(id)!.en = entry
	}

	// Add Arabic entries (match by ID or add as new)
	for (const entry of arEntries) {
		const id = entry.id || `fallback-ar-${entry.name.slice(0, 30)}`
		if (!mergedMap.has(id)) {
			mergedMap.set(id, { id })
			orderKeys.push(id)
		}
		mergedMap.get(id)!.ar = entry
	}

	return orderKeys.map((id) => mergedMap.get(id)!)
}

export function useSynaxarium() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const locale = useLocale()

	// === URL as source of truth ===
	const dateParam = searchParams.get('date')
	const viewParam = searchParams.get('view')
	const categoryParam = searchParams.get('category')
	const entryParam = searchParams.get('entry')

	const today = getTodayDateString()
	const currentDate = dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam) ? dateParam : today
	const viewMode: SynaxariumViewMode = viewParam === 'upcoming' ? 'upcoming' : 'day'
	const selectedCategory: CategoryId = (
		categoryParam && CATEGORIES.some((c) => c.id === categoryParam) ? categoryParam : 'all'
	) as CategoryId

	// === Derived from URL ===
	const isToday = currentDate === today
	const displayDate = formatGregorianDate(new Date(`${currentDate}T00:00:00`), locale)

	// === Local UI state ===
	const [searchQuery, setSearchQuery] = useState('')
	const [expandedEntry, setExpandedEntry] = useState<string | null>(null)

	// === Fetched data ===
	const [copticDate, setCopticDate] = useState<string | null>(null)
	const [entriesEn, setEntriesEn] = useState<SynaxariumEntry[]>([])
	const [entriesAr, setEntriesAr] = useState<SynaxariumEntry[]>([])
	const [loading, setLoading] = useState(true)
	const [searchResults, setSearchResults] = useState<SynaxariumSearchResult[]>([])
	const [isSearching, setIsSearching] = useState(false)

	// === URL update helper ===
	const updateUrl = useCallback(
		(updates: {
			date?: string | null
			view?: SynaxariumViewMode | null
			category?: CategoryId | null
		}) => {
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
		(mode: SynaxariumViewMode) => {
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

	// Fetch entries (both English and Arabic in parallel)
	useEffect(() => {
		if (viewMode !== 'day') return
		let cancelled = false
		setLoading(true)

		Promise.all([
			getSynaxariumByDate(currentDate, true), // English
			getSynaxariumByDate(currentDate, true, 'ar'), // Arabic
		]).then(([enData, arData]) => {
			if (!cancelled) {
				setEntriesEn(enData || [])
				setEntriesAr(arData || [])
				setLoading(false)
			}
		})

		return () => {
			cancelled = true
		}
	}, [currentDate, viewMode])

	// Merge entries by ID for bilingual display
	const bilingualEntries = useMemo(
		() => mergeEntriesById(entriesEn, entriesAr),
		[entriesEn, entriesAr],
	)

	// For backwards compatibility - English entries as primary
	const entries = entriesEn

	// Expand entry from URL param
	useEffect(() => {
		if (entryParam && bilingualEntries.length > 0) {
			const entry = bilingualEntries.find(
				(e) =>
					e.en?.name === decodeURIComponent(entryParam) ||
					e.ar?.name === decodeURIComponent(entryParam),
			)
			if (entry) setExpandedEntry(entry.id)
		}
	}, [entryParam, bilingualEntries])

	// Debounced search
	useEffect(() => {
		if (!searchQuery.trim()) {
			setSearchResults([])
			return
		}
		setIsSearching(true)
		const lang = locale === 'ar' ? 'ar' : undefined
		const timer = setTimeout(async () => {
			const results = await searchSynaxarium(searchQuery, lang)
			setSearchResults(results || [])
			setIsSearching(false)
		}, 300)
		return () => clearTimeout(timer)
	}, [searchQuery, locale])

	// === Derived data ===
	const showingSearch = searchQuery.trim().length > 0

	const filteredEntries = useMemo(() => {
		if (selectedCategory === 'all') return entries
		return entries.filter((e) => matchesCategory(e.name, selectedCategory))
	}, [entries, selectedCategory])

	const filteredBilingualEntries = useMemo(() => {
		if (selectedCategory === 'all') return bilingualEntries
		return bilingualEntries.filter((e) => {
			// Match on English name (primary) or Arabic if no English
			const name = e.en?.name || e.ar?.name || ''
			return matchesCategory(name, selectedCategory)
		})
	}, [bilingualEntries, selectedCategory])

	const filteredSearchResults = useMemo(() => {
		if (selectedCategory === 'all') return searchResults
		return searchResults.filter(
			(r) => r.entry.name && matchesCategory(r.entry.name, selectedCategory),
		)
	}, [searchResults, selectedCategory])

	const categoryCounts = useMemo(() => {
		const counts: Record<CategoryId, number> = {
			all: bilingualEntries.length,
			martyrs: 0,
			popes: 0,
			apostles: 0,
			departures: 0,
			feasts: 0,
			monastics: 0,
			bishops: 0,
		}
		for (const entry of bilingualEntries) {
			const name = entry.en?.name || entry.ar?.name || ''
			const cat = getCategoryForEntry(name)
			if (cat !== 'all') counts[cat]++
		}
		return counts
	}, [bilingualEntries])

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
		bilingualEntries,
		filteredBilingualEntries,
		loading,
		// Search
		searchQuery,
		searchResults,
		filteredSearchResults,
		isSearching,
		showingSearch,
		// UI state
		expandedEntry,
		setExpandedEntry,
		categoryCounts,
		// Actions
		setSearchQuery,
		navigateDate,
		handleViewModeChange,
		handleCategoryChange,
	}
}
