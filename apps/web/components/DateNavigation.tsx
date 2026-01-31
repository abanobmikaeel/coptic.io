'use client'

import { ChevronLeftIcon, ChevronRightIcon } from '@/components/ui/Icons'
import { getAdjacentDate, getTodayDateString } from '@/lib/utils'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import type { ReactNode } from 'react'

interface DateNavigationProps {
	currentDate?: string
	theme?: 'light' | 'sepia' | 'dark'
	children?: ReactNode
}

export function DateNavigation({ currentDate, theme = 'light', children }: DateNavigationProps) {
	const searchParams = useSearchParams()

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

	const buttonClass =
		theme === 'sepia'
			? 'text-amber-700 hover:bg-amber-100'
			: 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'

	return (
		<div className="flex items-center justify-center gap-3 mb-2">
			<Link
				href={buildUrl(prevDate)}
				className={`p-2 rounded-full transition-colors ${buttonClass}`}
				aria-label="Previous day"
			>
				<ChevronLeftIcon className="w-5 h-5" />
			</Link>
			{children}
			<Link
				href={buildUrl(nextDate)}
				className={`p-2 rounded-full transition-colors ${buttonClass}`}
				aria-label="Next day"
			>
				<ChevronRightIcon className="w-5 h-5" />
			</Link>
		</div>
	)
}
