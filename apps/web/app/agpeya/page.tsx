'use client'

import {
	type AgpeyaHour,
	AgpeyaHourSelector,
	getCurrentHour,
} from '@/components/AgpeyaHourSelector'
import { type AgpeyaHourData, AgpeyaPrayer } from '@/components/AgpeyaPrayer'
import { AgpeyaProgress } from '@/components/AgpeyaProgress'
import { BackToTop } from '@/components/BackToTop'
import { Breadcrumb } from '@/components/Breadcrumb'
import { DisplaySettings } from '@/components/DisplaySettings'
import { API_BASE_URL } from '@/config'
import { useReadingSettings } from '@/hooks/useReadingSettings'
import { getWidthClass, themeClasses } from '@/lib/reading-styles'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

function AgpeyaSkeleton({ theme }: { theme: 'light' | 'sepia' | 'dark' }) {
	const shimmer =
		theme === 'dark'
			? 'bg-gray-800 animate-pulse'
			: theme === 'sepia'
				? 'bg-[#e5dccb] animate-pulse'
				: 'bg-gray-200 animate-pulse'

	return (
		<div className="space-y-8">
			{/* Hour title skeleton */}
			<div className="mb-8">
				<div className={`h-8 w-32 rounded ${shimmer}`} />
				<div className={`h-4 w-24 rounded mt-2 ${shimmer}`} />
				<div className={`h-4 w-full max-w-md rounded mt-3 ${shimmer}`} />
			</div>

			{/* Opening prayer skeleton */}
			<div className="space-y-4">
				<div className={`h-6 w-full rounded ${shimmer}`} />
				<div className={`h-6 w-11/12 rounded ${shimmer}`} />
				<div className={`h-6 w-4/5 rounded ${shimmer}`} />
			</div>

			{/* Psalms section skeleton */}
			<div>
				<div
					className={`flex items-center justify-between py-3 border-b ${themeClasses.border[theme]}`}
				>
					<div className={`h-5 w-24 rounded ${shimmer}`} />
					<div className={`h-4 w-4 rounded ${shimmer}`} />
				</div>
				<div className="mt-6 space-y-6">
					{/* Psalm header */}
					<div className="flex items-center gap-2 py-2">
						<div className={`h-5 w-20 rounded ${shimmer}`} />
						<div className={`h-4 w-28 rounded ${shimmer}`} />
					</div>
					{/* Verses */}
					<div className="space-y-4">
						{[1, 2, 3, 4].map((i) => (
							<div key={i} className="flex gap-3">
								<div className={`h-5 w-5 rounded flex-shrink-0 ${shimmer}`} />
								<div className={`h-5 flex-1 rounded ${shimmer}`} />
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Gospel section skeleton */}
			<div>
				<div
					className={`flex items-center justify-between py-3 border-b ${themeClasses.border[theme]}`}
				>
					<div className="flex items-center gap-2">
						<div className={`h-5 w-16 rounded ${shimmer}`} />
						<div className={`h-4 w-24 rounded ${shimmer}`} />
					</div>
					<div className={`h-4 w-4 rounded ${shimmer}`} />
				</div>
				<div className="mt-6 space-y-4">
					{[1, 2, 3].map((i) => (
						<div key={i} className="flex gap-3">
							<div className={`h-5 w-6 rounded flex-shrink-0 ${shimmer}`} />
							<div className={`h-5 flex-1 rounded ${shimmer}`} />
						</div>
					))}
				</div>
			</div>

			{/* Litanies section skeleton */}
			<div>
				<div
					className={`flex items-center justify-between py-3 border-b ${themeClasses.border[theme]}`}
				>
					<div className={`h-5 w-20 rounded ${shimmer}`} />
					<div className={`h-4 w-4 rounded ${shimmer}`} />
				</div>
				<div className="mt-6 space-y-4">
					<div className={`h-6 w-full rounded ${shimmer}`} />
					<div className={`h-6 w-3/4 rounded ${shimmer}`} />
				</div>
			</div>
		</div>
	)
}

function AgpeyaContent() {
	const searchParams = useSearchParams()
	const { settings, mounted } = useReadingSettings()
	const [hourData, setHourData] = useState<AgpeyaHourData | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [recommendedHour, setRecommendedHour] = useState<AgpeyaHour>('prime')

	// Auto-detect recommended hour based on local time (runs client-side only)
	useEffect(() => {
		setRecommendedHour(getCurrentHour())
	}, [])

	// Determine current hour from URL or auto-detect
	const hourParam = searchParams.get('hour') as AgpeyaHour | null
	const currentHour = hourParam || recommendedHour

	const theme = settings.theme || 'light'
	const isRtl = settings.translation === 'ar'

	// Fetch hour data
	useEffect(() => {
		async function fetchHourData() {
			setLoading(true)
			setError(null)

			try {
				const response = await fetch(`${API_BASE_URL}/agpeya/${currentHour}`)
				if (response.ok) {
					const data = await response.json()
					setHourData(data)
				} else {
					setError('Unable to load prayer content. Please try again later.')
				}
			} catch {
				setError('Unable to load prayer content. Please try again later.')
			}

			setLoading(false)
		}

		fetchHourData()
	}, [currentHour])

	// Show skeleton during SSR/hydration - use light theme as default
	const effectiveTheme = mounted ? theme : 'light'

	return (
		<main
			className={`min-h-screen ${themeClasses.bg[effectiveTheme]} ${themeClasses.textHeading[effectiveTheme]} transition-colors duration-300`}
		>
			{/* Header */}
			<section className="relative pt-20 pb-4 px-6">
				<div className="max-w-4xl mx-auto">
					<Breadcrumb items={[{ label: 'Agpeya' }]} />
				</div>
			</section>

			{/* Sticky header with hour selector and settings */}
			<div
				className={`sticky top-14 z-30 ${themeClasses.bgTranslucent[effectiveTheme]} backdrop-blur-sm border-b ${themeClasses.border[effectiveTheme]}`}
			>
				<div className="max-w-4xl mx-auto px-6 py-3">
					<div className="flex items-center justify-between gap-4">
						{/* Hour selector (collapsed dropdown) */}
						<Suspense fallback={null}>
							<AgpeyaHourSelector
								currentHour={currentHour}
								recommendedHour={recommendedHour}
								theme={effectiveTheme}
							/>
						</Suspense>

						{/* Display settings */}
						<div className="flex-shrink-0">
							<Suspense fallback={null}>
								<DisplaySettings />
							</Suspense>
						</div>
					</div>
				</div>
			</div>

			{/* Content */}
			<div
				className={`${getWidthClass(settings.width || 'normal')} mx-auto px-6 pt-8 pb-32 lg:pb-24`}
			>
				{!mounted || loading ? (
					<AgpeyaSkeleton theme={effectiveTheme} />
				) : error ? (
					<section className="py-24 text-center">
						<p className={themeClasses.muted[effectiveTheme]}>{error}</p>
					</section>
				) : hourData ? (
					<AgpeyaPrayer
						hour={hourData}
						isRtl={isRtl}
						textSize={settings.textSize}
						fontFamily={settings.fontFamily}
						lineSpacing={settings.lineSpacing}
						wordSpacing={settings.wordSpacing}
						theme={effectiveTheme}
						weight={settings.weight}
					/>
				) : null}
			</div>

			{/* Progress navigation */}
			{hourData && (
				<AgpeyaProgress theme={effectiveTheme} psalmsCount={hourData.psalms?.length || 0} />
			)}

			{/* Back to top - hidden on mobile since we have progress nav */}
			<div className="hidden lg:block">
				<BackToTop />
			</div>
		</main>
	)
}

function AgpeyaFallback() {
	return (
		<main className="min-h-screen bg-white dark:bg-gray-900">
			{/* Header */}
			<section className="relative pt-20 pb-4 px-6">
				<div className="max-w-4xl mx-auto">
					<div className="h-4 w-16 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
				</div>
			</section>

			{/* Sticky header skeleton */}
			<div className="sticky top-14 z-30 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-800">
				<div className="max-w-4xl mx-auto px-6 py-3">
					<div className="flex items-center justify-between gap-4">
						<div className="h-10 w-40 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse" />
						<div className="h-10 w-10 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
					</div>
				</div>
			</div>

			{/* Content skeleton */}
			<div className="max-w-2xl mx-auto px-6 pt-8 pb-32">
				<AgpeyaSkeleton theme="light" />
			</div>
		</main>
	)
}

export default function AgpeyaPage() {
	return (
		<Suspense fallback={<AgpeyaFallback />}>
			<AgpeyaContent />
		</Suspense>
	)
}
