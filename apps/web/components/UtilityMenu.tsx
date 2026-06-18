'use client'

import type { Locale } from '@/i18n/config'
import { getNavGroups } from '@/lib/navConfig'
import { useLocale, useTranslations } from 'next-intl'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState, useTransition } from 'react'
import { SettingsIcon } from './ui/Icons'

const localeNames: Record<Locale, string> = {
	en: 'English',
	ar: 'العربية',
}

/**
 * Right-side utility ("gear") menu. Groups the low-frequency controls —
 * language, theme, and the meta links (Subscribe, Settings, Developers,
 * Privacy) — so the top bar stays uncluttered.
 */
export function UtilityMenu() {
	const t = useTranslations('nav')
	const { more } = getNavGroups(t)

	const [isOpen, setIsOpen] = useState(false)
	const ref = useRef<HTMLDivElement>(null)
	const pathname = usePathname()

	const locale = useLocale() as Locale
	const otherLocale: Locale = locale === 'en' ? 'ar' : 'en'
	const router = useRouter()
	const [isPending, startTransition] = useTransition()

	const { theme, setTheme } = useTheme()
	const [mounted, setMounted] = useState(false)
	useEffect(() => setMounted(true), [])

	// Close on outside click
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (ref.current && !ref.current.contains(event.target as Node)) {
				setIsOpen(false)
			}
		}
		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [])

	// Close on route change
	// biome-ignore lint/correctness/useExhaustiveDependencies: close whenever the route changes
	useEffect(() => {
		setIsOpen(false)
	}, [pathname])

	const switchLocale = () => {
		document.cookie = `NEXT_LOCALE=${otherLocale}; path=/; max-age=31536000`
		startTransition(() => router.refresh())
	}

	const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark')

	const rowClass =
		'flex items-center justify-between w-full px-4 py-2 text-left text-[13px] text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-colors'

	return (
		<div className="relative" ref={ref}>
			<button
				type="button"
				onClick={() => setIsOpen((o) => !o)}
				className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-colors"
				aria-label={t('more')}
				aria-expanded={isOpen}
			>
				<SettingsIcon className="w-[18px] h-[18px]" />
			</button>

			{isOpen && (
				<div className="absolute end-0 mt-2 w-56 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg">
					{/* Language */}
					<button type="button" onClick={switchLocale} disabled={isPending} className={rowClass}>
						<span>{t('language')}</span>
						<span className="text-gray-400 dark:text-gray-500">{localeNames[otherLocale]}</span>
					</button>

					{/* Theme */}
					<button type="button" onClick={toggleTheme} className={rowClass}>
						<span>{t('theme')}</span>
						<span className="text-gray-400 dark:text-gray-500 capitalize">
							{mounted ? theme : ''}
						</span>
					</button>

					<div className="my-1.5 border-t border-gray-200 dark:border-gray-800" />

					{/* Meta links */}
					{more.map((item) => (
						<Link
							key={item.href}
							href={item.href}
							className="block px-4 py-2 text-[13px] text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-colors"
						>
							{item.label}
						</Link>
					))}
				</div>
			)}
		</div>
	)
}
