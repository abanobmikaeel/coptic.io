'use client'

import { useSwipeGesture } from '@/hooks/useSwipeGesture'
import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { useCallback } from 'react'

interface LentSwipeContainerProps {
	children: ReactNode
	prevDate: string | null
	nextDate: string | null
	className?: string
}

export function LentSwipeContainer({
	children,
	prevDate,
	nextDate,
	className = '',
}: LentSwipeContainerProps) {
	const router = useRouter()

	const navigateToPrev = useCallback(() => {
		if (prevDate) router.push(`/lent/${prevDate}`)
	}, [prevDate, router])

	const navigateToNext = useCallback(() => {
		if (nextDate) router.push(`/lent/${nextDate}`)
	}, [nextDate, router])

	const swipeRef = useSwipeGesture<HTMLDivElement>({
		onSwipeLeft: nextDate ? navigateToNext : undefined,
		onSwipeRight: prevDate ? navigateToPrev : undefined,
		minSwipeDistance: 75,
	})

	return (
		<div ref={swipeRef} className={className}>
			{children}
		</div>
	)
}
