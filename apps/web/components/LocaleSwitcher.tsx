'use client'

import type { Locale } from '@/i18n/config'
import { useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'

const localeNames: Record<Locale, string> = {
	en: 'English',
	ar: 'العربية',
}

export function LocaleSwitcher() {
	const locale = useLocale() as Locale
	const router = useRouter()
	const [isPending, startTransition] = useTransition()

	const handleLocaleChange = (newLocale: Locale) => {
		document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`
		startTransition(() => {
			router.refresh()
		})
	}

	const otherLocale = locale === 'en' ? 'ar' : 'en'

	return (
		<button
			type="button"
			onClick={() => handleLocaleChange(otherLocale)}
			disabled={isPending}
			className="text-[13px] text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors disabled:opacity-50"
			aria-label={`Switch to ${localeNames[otherLocale]}`}
		>
			{isPending ? '...' : localeNames[otherLocale]}
		</button>
	)
}
