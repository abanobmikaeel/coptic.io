'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

export type ViewMode = 'verse' | 'continuous'

export function ViewModeToggle() {
	const router = useRouter()
	const pathname = usePathname()
	const searchParams = useSearchParams()

	const currentMode = (searchParams.get('view') as ViewMode) || 'verse'

	const handleChange = useCallback(
		(mode: ViewMode) => {
			const params = new URLSearchParams(searchParams.toString())

			if (mode === 'verse') {
				params.delete('view')
			} else {
				params.set('view', mode)
			}

			const queryString = params.toString()
			router.push(queryString ? `${pathname}?${queryString}` : pathname)
		},
		[router, pathname, searchParams],
	)

	return (
		<div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 p-0.5 bg-gray-100 dark:bg-gray-800">
			<button
				type="button"
				onClick={() => handleChange('verse')}
				className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
					currentMode === 'verse'
						? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
						: 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
				}`}
				aria-pressed={currentMode === 'verse'}
			>
				Study
			</button>
			<button
				type="button"
				onClick={() => handleChange('continuous')}
				className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
					currentMode === 'continuous'
						? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
						: 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
				}`}
				aria-pressed={currentMode === 'continuous'}
			>
				Reading
			</button>
		</div>
	)
}
