'use client'

import { ChevronLeftIcon, ChevronRightIcon } from '@/components/ui/Icons'
import { themeClasses } from '@/lib/reading-styles'
import { getAdjacentDate, getTodayDateString } from '@/lib/utils'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import type { ReactNode } from 'react'

interface DateNavigationProps {
	theme?: 'light' | 'sepia' | 'dark'
	children?: ReactNode
}

export function DateNavigation({ theme = 'light', children }: DateNavigationProps) {
	const searchParams = useSearchParams()

	// Read current date from URL params (client-side source of truth)
	const currentDate = searchParams.get('date') || undefined

	const buildUrl = (targetDate: string) => {
		const params = new URLSearchParams(searchParams.toString())
		const today = getTodayDateString()

		if (targetDate === today) {
			params.delete('date')
		} else {
			params.set('date', targetDate)
		}

		const queryString = params.toString()
		return `/readings${queryString ? `?${queryString}` : ''}`
	}

	const prevDate = getAdjacentDate(currentDate, -1)
	const nextDate = getAdjacentDate(currentDate, 1)

	const buttonClass = themeClasses.navChevron[theme]

	return (
		<div className="flex items-center justify-center gap-1 sm:gap-2">
			<Link
				href={buildUrl(prevDate)}
				className={`p-1.5 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 ${buttonClass}`}
				aria-label="Previous day"
			>
				<ChevronLeftIcon className="w-4 h-4 sm:w-5 sm:h-5" />
			</Link>
			{children}
			<Link
				href={buildUrl(nextDate)}
				className={`p-1.5 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 ${buttonClass}`}
				aria-label="Next day"
			>
				<ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5" />
			</Link>
		</div>
	)
}
