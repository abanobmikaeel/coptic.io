'use client'

import { AGPEYA_HOURS, type AgpeyaHour, getCurrentHour } from '@/components/AgpeyaHourSelector'
import {
	LiturgicalServiceReader,
	ServiceReaderFallback,
} from '@/components/LiturgicalServiceReader'
import type { BibleTranslation } from '@/components/ScriptureReading/types'
import type { IncenseService } from '@/lib/types'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

export const AgpeyaFallback = ServiceReaderFallback

interface AgpeyaContentProps {
	servicesByLang: Partial<Record<string, IncenseService>>
	langs: BibleTranslation[]
	hourId: AgpeyaHour
	hasHourParam: boolean
	notice?: string
}

export function AgpeyaContent({
	servicesByLang,
	langs,
	hourId,
	hasHourParam,
	notice,
}: AgpeyaContentProps) {
	const router = useRouter()
	const searchParams = useSearchParams()
	const [open, setOpen] = useState(false)

	// Build an hour URL that preserves the current reading settings (theme, size,
	// mode, …) so switching hours doesn't reset the reader.
	const hrefForHour = (id: string) => {
		const p = new URLSearchParams(searchParams.toString())
		p.set('hour', id)
		return `/agpeya?${p.toString()}`
	}
	// The hour for the current time, marked with a "now" badge. Set after mount to
	// avoid an SSR/client hydration mismatch (depends on the device clock).
	const [nowHour, setNowHour] = useState<AgpeyaHour | null>(null)
	const ref = useRef<HTMLDivElement>(null)

	useEffect(() => setNowHour(getCurrentHour()), [])

	// Fresh entry with no ?hour= — jump to the hour appropriate for the current time.
	// biome-ignore lint/correctness/useExhaustiveDependencies: only re-run on entry/hour change
	useEffect(() => {
		if (hasHourParam) return
		const now = getCurrentHour()
		if (now !== hourId) router.replace(hrefForHour(now))
	}, [hasHourParam, hourId, router])

	useEffect(() => {
		const onClick = (e: MouseEvent) => {
			if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
		}
		document.addEventListener('mousedown', onClick)
		return () => document.removeEventListener('mousedown', onClick)
	}, [])

	const current = AGPEYA_HOURS.find((h) => h.id === hourId) ?? AGPEYA_HOURS[0]

	const hourSwitcher = (
		<div className="flex items-center gap-1.5">
			{/* Separator so the hour reads as a breadcrumb continuation: Agpeya › Prime */}
			<svg
				width="14"
				height="14"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				className="text-gray-400 dark:text-gray-600 shrink-0 rtl:rotate-180"
				aria-hidden="true"
			>
				<path d="m9 18 6-6-6-6" />
			</svg>
			<div className="relative" ref={ref}>
				<button
					type="button"
					onClick={() => setOpen((o) => !o)}
					className="flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-amber-600 dark:hover:text-amber-500 transition-colors"
					aria-haspopup="true"
					aria-expanded={open}
				>
					{current.name}
					{nowHour === hourId && (
						<span
							className="ms-1 w-1.5 h-1.5 rounded-full bg-amber-500"
							aria-label="current hour"
						/>
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
					<div className="absolute start-0 mt-2 w-44 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg z-50">
						{AGPEYA_HOURS.map((h) => (
							<button
								key={h.id}
								type="button"
								onClick={() => {
									setOpen(false)
									router.push(hrefForHour(h.id))
								}}
								className={`flex items-center justify-between gap-2 w-full text-start px-4 py-2 text-[13px] transition-colors ${
									h.id === hourId
										? 'text-amber-600 dark:text-amber-500'
										: 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/[0.05]'
								}`}
							>
								<span>{h.name}</span>
								{nowHour === h.id && (
									<span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
										now
									</span>
								)}
							</button>
						))}
					</div>
				)}
			</div>
		</div>
	)

	return (
		<LiturgicalServiceReader
			title="Agpeya"
			basePath="/agpeya"
			servicesByLang={servicesByLang}
			langs={langs}
			notice={notice}
			headerCenter={hourSwitcher}
		/>
	)
}
