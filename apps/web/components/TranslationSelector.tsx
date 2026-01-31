'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

type BibleTranslation = 'en' | 'ar'

const translations: { value: BibleTranslation; label: string }[] = [
	{ value: 'en', label: 'English' },
	{ value: 'ar', label: 'العربية' },
]

export function TranslationSelector() {
	const router = useRouter()
	const pathname = usePathname()
	const searchParams = useSearchParams()

	const currentLang = (searchParams.get('lang') as BibleTranslation) || 'en'

	const handleChange = useCallback(
		(newLang: BibleTranslation) => {
			const params = new URLSearchParams(searchParams.toString())

			if (newLang === 'en') {
				params.delete('lang')
			} else {
				params.set('lang', newLang)
			}

			const queryString = params.toString()
			router.push(queryString ? `${pathname}?${queryString}` : pathname)
		},
		[router, pathname, searchParams],
	)

	return (
		<div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 p-0.5 bg-gray-100 dark:bg-gray-800">
			{translations.map((t) => (
				<button
					key={t.value}
					type="button"
					onClick={() => handleChange(t.value)}
					className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
						currentLang === t.value
							? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
							: 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
					}`}
					aria-pressed={currentLang === t.value}
				>
					{t.label}
				</button>
			))}
		</div>
	)
}
