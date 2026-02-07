'use client'

import { useSwipeGesture } from '@/hooks/useSwipeGesture'
import { getAdjacentDate, getTodayDateString } from '@/lib/utils'
import { useRouter, useSearchParams } from 'next/navigation'
import type { ReactNode } from 'react'
import { useCallback } from 'react'

interface SwipeableContainerProps {
	children: ReactNode
	basePath: string
	className?: string
}

/**
 * Wrapper component that enables swipe navigation between dates.
 * Swipe left to go to the next day, swipe right to go to the previous day.
 */
export function SwipeableContainer({
	children,
	basePath,
	className = '',
}: SwipeableContainerProps) {
	const router = useRouter()
	const searchParams = useSearchParams()

	const currentDate = searchParams.get('date') || undefined

	const buildUrl = useCallback(
		(targetDate: string) => {
			const params = new URLSearchParams(searchParams.toString())
			const today = getTodayDateString()

			if (targetDate === today) {
				params.delete('date')
			} else {
				params.set('date', targetDate)
			}

			const queryString = params.toString()
			return `${basePath}${queryString ? `?${queryString}` : ''}`
		},
		[basePath, searchParams],
	)

	const navigateToPrevDay = useCallback(() => {
		const prevDate = getAdjacentDate(currentDate, -1)
		router.push(buildUrl(prevDate))
	}, [currentDate, buildUrl, router])

	const navigateToNextDay = useCallback(() => {
		const nextDate = getAdjacentDate(currentDate, 1)
		router.push(buildUrl(nextDate))
	}, [currentDate, buildUrl, router])

	const swipeRef = useSwipeGesture<HTMLDivElement>({
		onSwipeLeft: navigateToNextDay,
		onSwipeRight: navigateToPrevDay,
		minSwipeDistance: 75, // Require a bit more distance to avoid accidental triggers
	})

	return (
		<div ref={swipeRef} className={className}>
			{children}
		</div>
	)
}
