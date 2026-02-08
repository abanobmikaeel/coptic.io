'use client'

import { getSynaxariumByDate } from '@/lib/api'
import type { SynaxariumEntry } from '@/lib/types'
import { addDaysToDateString, getTodayDateString } from '@/lib/utils/dateFormatters'
import { useLocale, useTranslations } from 'next-intl'
import { useCallback, useEffect, useRef, useState } from 'react'
import { SynaxariumDayCard } from './SynaxariumDayCard'

interface DayData {
	date: string
	entries: SynaxariumEntry[]
	loading: boolean
}

interface UpcomingSynaxariumProps {
	startDate: string
	daysToShow?: number
	selectedCategory: string
	getCategoryLabelKey: (name: string) => string
	getCategoryColor: (name: string) => string
	matchesCategory: (name: string, category: string) => boolean
}

function formatUpcomingDate(dateStr: string, locale: string): string {
	const d = new Date(`${dateStr}T00:00:00`)
	return d.toLocaleDateString(locale, {
		weekday: 'short',
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	})
}

const INITIAL_DAYS = 7
const TOTAL_DAYS = 14

export function UpcomingSynaxarium({
	startDate,
	daysToShow = TOTAL_DAYS,
	selectedCategory,
	getCategoryLabelKey,
	getCategoryColor,
	matchesCategory,
}: UpcomingSynaxariumProps) {
	const locale = useLocale()
	const t = useTranslations('synaxarium')
	const [days, setDays] = useState<DayData[]>([])
	const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set())
	const [loadingEntries, setLoadingEntries] = useState<Set<string>>(new Set())
	const [visibleDays, setVisibleDays] = useState(INITIAL_DAYS)
	const [isLoadingMore, setIsLoadingMore] = useState(false)
	const containerRef = useRef<HTMLDivElement>(null)

	// Fetch initial days (non-detailed for speed)
	useEffect(() => {
		const fetchInitialDays = async () => {
			const initialDays: DayData[] = []
			for (let i = 0; i < daysToShow; i++) {
				initialDays.push({
					date: addDaysToDateString(startDate, i),
					entries: [],
					loading: true,
				})
			}
			setDays(initialDays)

			// Fetch first batch in parallel
			const firstBatchPromises = initialDays.slice(0, INITIAL_DAYS).map(async (day, idx) => {
				const data = await getSynaxariumByDate(day.date, false)
				return { idx, entries: data || [] }
			})

			const firstBatchResults = await Promise.all(firstBatchPromises)
			setDays((prev) => {
				const updated = [...prev]
				for (const result of firstBatchResults) {
					updated[result.idx] = { ...updated[result.idx], entries: result.entries, loading: false }
				}
				return updated
			})

			// Fetch remaining days in background
			const remainingPromises = initialDays.slice(INITIAL_DAYS).map(async (day, idx) => {
				const data = await getSynaxariumByDate(day.date, false)
				return { idx: idx + INITIAL_DAYS, entries: data || [] }
			})

			const remainingResults = await Promise.all(remainingPromises)
			setDays((prev) => {
				const updated = [...prev]
				for (const result of remainingResults) {
					updated[result.idx] = { ...updated[result.idx], entries: result.entries, loading: false }
				}
				return updated
			})
		}

		fetchInitialDays()
	}, [startDate, daysToShow])

	// Handle scroll to load more days
	const handleScroll = useCallback(() => {
		if (!containerRef.current || isLoadingMore || visibleDays >= daysToShow) return

		const container = containerRef.current
		const scrollBottom = container.scrollHeight - container.scrollTop - container.clientHeight

		if (scrollBottom < 200) {
			setIsLoadingMore(true)
			setVisibleDays((prev) => Math.min(prev + INITIAL_DAYS, daysToShow))
			setIsLoadingMore(false)
		}
	}, [isLoadingMore, visibleDays, daysToShow])

	useEffect(() => {
		const container = containerRef.current
		if (!container) return

		container.addEventListener('scroll', handleScroll)
		return () => container.removeEventListener('scroll', handleScroll)
	}, [handleScroll])

	// Handle entry expansion with lazy detail loading
	const handleEntryExpand = useCallback(
		async (entryKey: string) => {
			const isExpanded = expandedEntries.has(entryKey)

			if (isExpanded) {
				setExpandedEntries((prev) => {
					const next = new Set(prev)
					next.delete(entryKey)
					return next
				})
				return
			}

			// Parse the entry key to get date and index
			const [date, idxStr] = entryKey.split('-')
			const idx = parseInt(idxStr, 10)

			// Find the day and entry
			const dayData = days.find((d) => d.date === date)
			if (!dayData) return

			const entry = dayData.entries[idx]
			if (!entry) return

			// If we already have the detailed text, just expand
			if (entry.text) {
				setExpandedEntries((prev) => new Set(prev).add(entryKey))
				return
			}

			// Otherwise, fetch detailed data
			setLoadingEntries((prev) => new Set(prev).add(entryKey))

			const detailedData = await getSynaxariumByDate(date, true)
			if (detailedData?.[idx]) {
				setDays((prev) => {
					const updated = [...prev]
					const dayIdx = updated.findIndex((d) => d.date === date)
					if (dayIdx !== -1) {
						const updatedEntries = [...updated[dayIdx].entries]
						updatedEntries[idx] = detailedData[idx]
						updated[dayIdx] = { ...updated[dayIdx], entries: updatedEntries }
					}
					return updated
				})
			}

			setLoadingEntries((prev) => {
				const next = new Set(prev)
				next.delete(entryKey)
				return next
			})
			setExpandedEntries((prev) => new Set(prev).add(entryKey))
		},
		[days, expandedEntries],
	)

	const today = getTodayDateString()
	const tomorrow = addDaysToDateString(today, 1)
	const visibleDayData = days.slice(0, visibleDays)

	// Check if all visible days have finished loading
	const allLoaded = visibleDayData.every((d) => !d.loading)

	return (
		<div ref={containerRef} className="max-h-[calc(100vh-300px)] overflow-y-auto -mx-6 px-6">
			{visibleDayData.map((day) => (
				<SynaxariumDayCard
					key={day.date}
					date={day.date}
					displayDate={formatUpcomingDate(day.date, locale)}
					isToday={day.date === today}
					isTomorrow={day.date === tomorrow}
					entries={day.entries}
					selectedCategory={selectedCategory}
					getCategoryLabelKey={getCategoryLabelKey}
					getCategoryColor={getCategoryColor}
					matchesCategory={matchesCategory}
					onEntryExpand={handleEntryExpand}
					expandedEntries={expandedEntries}
					loadingEntries={loadingEntries}
				/>
			))}

			{/* Loading indicator */}
			{!allLoaded && (
				<div className="flex justify-center py-8">
					<div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
				</div>
			)}
		</div>
	)
}
