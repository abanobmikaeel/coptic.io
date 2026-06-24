import { Breadcrumb } from '@/components/Breadcrumb'
import { JsonLd } from '@/components/JsonLd'
import { ReadingPageLayout } from '@/components/ReadingPageLayout'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { getSynaxariumByCopticDate } from '@/lib/api'
import {
	canonicalizeCopticDate,
	copticDateFromSegment,
	copticDateSegments,
	copticDateToSegment,
} from '@/lib/coptic-dates'
import { buildSynaxariumJsonLd, cleanEntryName, describeSynaxarium } from '@/lib/synaxarium'
import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { Suspense } from 'react'
import { ScrollToEntry } from './ScrollToEntry'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://coptic.io'

type PageProps = { params: Promise<{ date: string }> }

// Enumerate every valid Coptic day so Next knows the canonical path set (any
// other date falls through to notFound()). The route renders ISR/dynamic
// app-wide — next-intl reads cookies/headers for locale — rather than being
// build-time prerendered, but `revalidate` caches the data and crawlers get
// full server-rendered HTML.
export function generateStaticParams() {
	return copticDateSegments().map((date) => ({ date }))
}

function truncate(text: string, max: number): string {
	return text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { date } = await params
	// Metadata runs before the page redirects/404s, so fall back to the raw date
	// for non-canonical/empty URLs — they still emit (noindex) metadata.
	const copticDate =
		canonicalizeCopticDate(copticDateFromSegment(date)) ?? copticDateFromSegment(date)
	const entries = (await getSynaxariumByCopticDate(copticDate)) ?? []
	const names = entries.map((entry) => cleanEntryName(entry.name))
	const canonical = `${BASE_URL}/synaxarium/${copticDateToSegment(copticDate)}`

	const title = names.length
		? `${copticDate}: ${names.slice(0, 2).join('; ')}${names.length > 2 ? ` & ${names.length - 2} more` : ''} — Coptic Synaxarium`
		: `${copticDate} — Coptic Synaxarium`

	const description = truncate(describeSynaxarium(copticDate, names), 200)

	return {
		title,
		description,
		alternates: { canonical },
		openGraph: { title, description, url: canonical, type: 'article' },
		// Don't let empty/invalid dates into the index.
		...(names.length ? {} : { robots: { index: false, follow: true } }),
	}
}

export default async function SynaxariumDatePage({ params }: PageProps) {
	const { date } = await params
	const copticDate = canonicalizeCopticDate(copticDateFromSegment(date))

	// Genuinely invalid dates → 404; non-canonical casing/format → 308 to canonical.
	if (!copticDate) notFound()
	const canonicalSegment = copticDateToSegment(copticDate)
	if (canonicalSegment !== date) permanentRedirect(`/synaxarium/${canonicalSegment}`)

	const entries = (await getSynaxariumByCopticDate(copticDate)) ?? []
	const names = entries.map((entry) => cleanEntryName(entry.name))
	const canonicalUrl = `${BASE_URL}/synaxarium/${canonicalSegment}`

	// Structured data so search engines / AI extractors understand the page and
	// the saints it commemorates (Article + about) and its place in the site.
	const jsonLd = buildSynaxariumJsonLd({
		copticDate,
		names,
		canonicalUrl,
		baseUrl: BASE_URL,
	})

	return (
		<ReadingPageLayout theme="light" className="relative">
			<JsonLd data={jsonLd} />
			<Suspense fallback={null}>
				<ScrollToEntry />
			</Suspense>

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
					{entries.length === 0 ? (
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
								<ul className="space-y-8">
									{entries.map((entry, idx) => (
										<li
											key={entry.id ?? idx}
											data-entry={entry.name}
											className="border-b border-gray-100 dark:border-gray-800 last:border-0 pb-8 last:pb-0 scroll-mt-24"
										>
											<h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
												{entry.name}
											</h2>
											{entry.text && (
												<div className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed whitespace-pre-line">
													{entry.text}
												</div>
											)}
											{entry.url && (
												<a
													href={entry.url}
													target="_blank"
													rel="noopener noreferrer"
													className="inline-block mt-3 text-amber-600 dark:text-amber-500 hover:underline text-xs"
												>
													Source: copticchurch.net
												</a>
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
