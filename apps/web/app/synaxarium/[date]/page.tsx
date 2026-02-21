'use client'

import { Breadcrumb } from '@/components/Breadcrumb'
import { ReadingPageLayout } from '@/components/ReadingPageLayout'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { ChevronRightIcon } from '@/components/ui/Icons'
import { getSynaxariumByCopticDate } from '@/lib/api'
import type { SynaxariumEntry } from '@/lib/types'
import { useParams, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'

export default function SynaxariumDatePage() {
	const params = useParams()
	const searchParams = useSearchParams()
	const dateParam = params.date as string
	const copticDate = decodeURIComponent(dateParam).replace(/-/g, ' ')
	const entryParam = searchParams.get('entry')

	const [entries, setEntries] = useState<SynaxariumEntry[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(false)
	const [expanded, setExpanded] = useState<number | null>(null)
	const expandedRef = useRef<HTMLLIElement>(null)

	// Find the entry index that matches the query param
	const initialExpandedIndex = useMemo(() => {
		if (!entryParam || entries.length === 0) return null
		const decodedEntry = decodeURIComponent(entryParam)
		const idx = entries.findIndex((e) => e.name === decodedEntry)
		return idx >= 0 ? idx : null
	}, [entryParam, entries])

	// Set initial expanded state when entries load
	useEffect(() => {
		if (initialExpandedIndex !== null && expanded === null) {
			setExpanded(initialExpandedIndex)
		}
	}, [initialExpandedIndex, expanded])

	// Scroll to expanded entry
	useEffect(() => {
		if (expanded !== null && expandedRef.current) {
			expandedRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
		}
	}, [expanded])

	useEffect(() => {
		let cancelled = false
		setLoading(true)
		setError(false)

		getSynaxariumByCopticDate(copticDate).then((data) => {
			if (!cancelled) {
				if (data) {
					setEntries(data)
				} else {
					setError(true)
				}
				setLoading(false)
			}
		})

		return () => {
			cancelled = true
		}
	}, [copticDate])

	return (
		<ReadingPageLayout theme="light" className="relative">
			{/* Background */}
			<div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none">
				<div className="absolute top-20 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-amber-500/[0.03] dark:bg-amber-500/[0.05] rounded-full blur-[100px]" />
			</div>

			{/* Header */}
			<section className="relative pt-20 pb-8 px-6">
				<div className="max-w-4xl mx-auto">
					<Breadcrumb
						items={[{ label: 'Synaxarium', href: '/synaxarium' }, { label: copticDate }]}
					/>
					<h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Synaxarium</h1>
					<p className="text-xl text-amber-600 dark:text-amber-500 font-medium">{copticDate}</p>
				</div>
			</section>

			{/* Content */}
			<section className="relative px-6 pb-16">
				<div className="max-w-4xl mx-auto">
					{loading ? (
						<div className="flex justify-center py-12">
							<div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
						</div>
					) : error ? (
						<Card>
							<CardContent>
								<p className="text-gray-500 text-center py-8">
									No synaxarium entries found for {copticDate}.
								</p>
							</CardContent>
						</Card>
					) : (
						<Card>
							<CardHeader>
								{entries.length} Commemoration{entries.length !== 1 ? 's' : ''}
							</CardHeader>
							<CardContent>
								<ul className="space-y-3">
									{entries.map((entry, idx) => (
										<li
											key={idx}
											ref={expanded === idx ? expandedRef : null}
											className="border-b border-gray-100 dark:border-gray-800 last:border-0 pb-3 last:pb-0"
										>
											<button
												type="button"
												onClick={() => setExpanded(expanded === idx ? null : idx)}
												className="w-full flex items-start gap-2 text-left group"
											>
												<ChevronRightIcon
													className={`w-4 h-4 mt-1 flex-shrink-0 text-gray-400 transition-transform duration-200 ${
														expanded === idx ? 'rotate-90' : ''
													}`}
												/>
												<span className="text-gray-700 dark:text-gray-300 group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors">
													{entry.name}
												</span>
											</button>

											{expanded === idx && entry.text && (
												<div className="mt-3 ml-6 text-gray-600 dark:text-gray-400 text-sm leading-relaxed whitespace-pre-line animate-in fade-in slide-in-from-top-2 duration-200">
													{entry.text}
													{entry.url && (
														<a
															href={entry.url}
															target="_blank"
															rel="noopener noreferrer"
															className="block mt-3 text-amber-600 dark:text-amber-500 hover:underline text-xs"
														>
															Source: copticchurch.net
														</a>
													)}
												</div>
											)}
										</li>
									))}
								</ul>
							</CardContent>
						</Card>
					)}
				</div>
			</section>
		</ReadingPageLayout>
	)
}
