'use client'

import type { ReadingTheme } from '@/components/DisplaySettings'
import {
	LiturgicalServiceReader,
	ServiceReaderFallback,
} from '@/components/LiturgicalServiceReader'
import type { BibleTranslation } from '@/components/ScriptureReading/types'
import { themeClasses } from '@/lib/reading-styles'
import {
	TASBEHA_DAYS,
	type TasbehaDayId,
	getCurrentTasbehaDay,
	getTasbehaDay,
	tasbehaPraiseLabel,
	tasbehaRiteLabel,
} from '@/lib/tasbehaDays'
import type { IncenseService } from '@/lib/types'
import { useLocale } from 'next-intl'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

export const TasbehaFallback = ServiceReaderFallback

interface TasbehaContentProps {
	servicesByLang: Partial<Record<string, IncenseService>>
	langs: BibleTranslation[]
	dayId: TasbehaDayId
	unsupportedLanguage?: boolean
}

export function TasbehaContent({
	servicesByLang,
	langs,
	dayId,
	unsupportedLanguage,
}: Readonly<TasbehaContentProps>) {
	const locale = useLocale()
	const isArabic = locale === 'ar'
	const router = useRouter()
	const searchParams = useSearchParams()
	const [open, setOpen] = useState(false)
	const ref = useRef<HTMLDivElement>(null)

	// Build a day URL that preserves the current reading settings (theme, size,
	// mode, …) so switching days doesn't reset the reader.
	const hrefForDay = (id: TasbehaDayId) => {
		const params = new URLSearchParams(searchParams.toString())
		params.set('day', id)
		return `/tasbeha?${params.toString()}`
	}

	// The day prayed right now, marked with a dot. Set after mount so the device
	// clock can't cause an SSR/client hydration mismatch.
	const [today, setToday] = useState<TasbehaDayId | null>(null)
	useEffect(() => setToday(getCurrentTasbehaDay()), [])

	useEffect(() => {
		const onClick = (e: MouseEvent) => {
			if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
		}
		document.addEventListener('mousedown', onClick)
		return () => document.removeEventListener('mousedown', onClick)
	}, [])

	const current = getTasbehaDay(dayId)
	const languageNotice = unsupportedLanguage
		? isArabic
			? 'التسبحة متاحة حاليًا بالقبطية والعربية والإنجليزية؛ يتم عرض الإنجليزية.'
			: 'Tasbeha is currently available in Coptic, English, and Arabic — showing English.'
		: null

	// Breadcrumb continuation — Tasbeha › Wednesday — with the rite line beneath, so
	// the tune and whether it is a Midnight or Vespers Praise are always visible.
	const daySwitcher = (theme: ReadingTheme) => (
		<div className="flex items-center gap-1.5">
			<svg
				width="14"
				height="14"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				className={`${themeClasses.breadcrumbChevron[theme]} shrink-0 rtl:rotate-180`}
				aria-hidden="true"
			>
				<path d="m9 18 6-6-6-6" />
			</svg>
			<div className="relative" ref={ref}>
				<button
					type="button"
					onClick={() => setOpen((o) => !o)}
					className={`flex items-center gap-1 text-sm font-medium ${themeClasses.breadcrumbActive[theme]} hover:text-amber-600 transition-colors`}
					aria-haspopup="true"
					aria-expanded={open}
				>
					{isArabic ? current.nameAr : current.name}
					{today === dayId && (
						<span className="ms-1 w-1.5 h-1.5 rounded-full bg-amber-500" aria-label="today" />
					)}
					<svg
						width="12"
						height="12"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						className={`transition-transform ${open ? 'rotate-180' : ''}`}
						aria-hidden="true"
					>
						<path d="m6 9 6 6 6-6" />
					</svg>
				</button>
				{open && (
					<div
						className={`absolute start-0 mt-2 w-56 py-1.5 border rounded-xl shadow-lg z-50 ${themeClasses.dropdownBg[theme]}`}
					>
						{TASBEHA_DAYS.map((day) => (
							<button
								key={day.id}
								type="button"
								onClick={() => {
									setOpen(false)
									router.push(hrefForDay(day.id))
								}}
								className={`flex items-center justify-between gap-2 w-full text-start px-4 py-2 text-[13px] transition-colors ${
									day.id === dayId
										? themeClasses.dropdownActiveText[theme]
										: themeClasses.dropdownText[theme]
								}`}
							>
								<span className="flex flex-col items-start">
									<span>{isArabic ? day.nameAr : day.name}</span>
									<span className={`text-[10px] ${themeClasses.dropdownMuted[theme]}`}>
										{tasbehaPraiseLabel(day, isArabic)}
										{' · '}
										{day.tune === 'adam'
											? isArabic
												? 'آدام'
												: 'Adam'
											: isArabic
												? 'واطس'
												: 'Watos'}
									</span>
								</span>
								{today === day.id && (
									<span
										className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${themeClasses.dropdownBadge[theme]}`}
									>
										{isArabic ? 'اليوم' : 'today'}
									</span>
								)}
							</button>
						))}
					</div>
				)}
			</div>
			<span
				className={`hidden sm:inline ${themeClasses.breadcrumbChevron[theme]}`}
				aria-hidden="true"
			>
				|
			</span>
			<div className="hidden sm:flex items-center gap-1.5">
				<svg
					width="14"
					height="14"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					className="text-amber-500"
					aria-hidden="true"
				>
					<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
				</svg>
				<span
					className={`text-xs sm:text-sm whitespace-nowrap ${themeClasses.breadcrumbLink[theme]}`}
				>
					{tasbehaRiteLabel(current, isArabic)}
				</span>
			</div>
		</div>
	)

	return (
		<LiturgicalServiceReader
			title={isArabic ? 'التسبحة' : 'Tasbeha'}
			basePath="/tasbeha"
			servicesByLang={servicesByLang}
			langs={langs}
			availableLanguages={['en', 'cop', 'ar']}
			contentLayout="stanzas"
			rowsPerPageByKind={{ opening: 2, canticle: 2 }}
			notice={languageNotice ?? undefined}
			headerCenter={daySwitcher}
		/>
	)
}
