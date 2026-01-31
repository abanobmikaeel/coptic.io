'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

export function VerseToggle() {
	const router = useRouter()
	const pathname = usePathname()
	const searchParams = useSearchParams()

	const showVerses = searchParams.get('verses') !== 'hide'

	const handleToggle = useCallback(() => {
		const params = new URLSearchParams(searchParams.toString())

		if (showVerses) {
			params.set('verses', 'hide')
		} else {
			params.delete('verses')
		}

		const queryString = params.toString()
		router.push(queryString ? `${pathname}?${queryString}` : pathname)
	}, [router, pathname, searchParams, showVerses])

	return (
		<button
			type="button"
			onClick={handleToggle}
			className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
				showVerses
					? 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
					: 'border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
			}`}
			aria-pressed={showVerses}
		>
			<span className="font-mono text-xs mr-1.5">123</span>
			<span>{showVerses ? 'On' : 'Off'}</span>
		</button>
	)
}
