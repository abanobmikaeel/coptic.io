'use client'

import {
	AGPEYA_HOURS,
	type AgpeyaHour,
	MIDNIGHT_WATCHES,
	type MidnightWatch,
	getCurrentHour,
} from '@/components/AgpeyaHourSelector'
import {
	type AgpeyaHourData,
	type AgpeyaMidnightData,
	AgpeyaPrayer,
} from '@/components/AgpeyaPrayer'
import { AgpeyaProgress } from '@/components/AgpeyaProgress'
import { BackToTop } from '@/components/BackToTop'
import { Breadcrumb } from '@/components/Breadcrumb'
import { DisplaySettings } from '@/components/DisplaySettings'
import { CloseIcon } from '@/components/ui/Icons'
import { API_BASE_URL } from '@/config'
import { useNavigation } from '@/contexts/NavigationContext'
import { useReadingSettings } from '@/hooks/useReadingSettings'
import { getWidthClass, themeClasses } from '@/lib/reading-styles'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useCallback, useEffect, useState } from 'react'

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
	const router = useRouter()
	const searchParams = useSearchParams()
	const { settings, mounted } = useReadingSettings()
	const { mode } = useNavigation()
	const [hourData, setHourData] = useState<AgpeyaHourData | AgpeyaMidnightData | null>(null)
	const [loading, setLoading] = useState(true)
	const [showSkeleton, setShowSkeleton] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [recommendedHour, setRecommendedHour] = useState<AgpeyaHour>('prime')
	const [allCollapsed, setAllCollapsed] = useState(false)

	// Auto-detect recommended hour based on local time (runs client-side only)
	useEffect(() => {
		setRecommendedHour(getCurrentHour())
	}, [])

	// Determine current hour and watch from URL or auto-detect
	const hourParam = searchParams.get('hour') as AgpeyaHour | null
	const watchParam = searchParams.get('watch') as MidnightWatch | null
	const currentHour = hourParam || recommendedHour
	const currentWatch: MidnightWatch = watchParam || '1'

	const theme = settings.theme || 'light'
	const isRtl = settings.translation === 'ar'

	// Handle hour change from breadcrumb dropdown
	const handleHourChange = useCallback(
		(hourId: string) => {
			const params = new URLSearchParams(searchParams.toString())
			params.set('hour', hourId)
			if (hourId === 'midnight') {
				params.set('watch', '1')
			} else {
				params.delete('watch')
			}
			router.push(`/agpeya?${params.toString()}`)
		},
		[router, searchParams],
	)

	// Build dropdown options for breadcrumb
	const hourOptions = AGPEYA_HOURS.map((hour) => ({
		id: hour.id,
		label: hour.name,
		sublabel: `${hour.englishName} · ${hour.traditionalTime}`,
		badge: hour.id === recommendedHour ? 'NOW' : undefined,
	}))

	// Fetch hour data with delayed skeleton (only show if loading > 150ms)
	useEffect(() => {
		let skeletonTimeout: NodeJS.Timeout | null = null

		async function fetchHourData() {
			setLoading(true)
			setShowSkeleton(false)
			setError(null)

			// Only show skeleton if loading takes more than 150ms
			skeletonTimeout = setTimeout(() => setShowSkeleton(true), 200)

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

			if (skeletonTimeout) clearTimeout(skeletonTimeout)
			setLoading(false)
			setShowSkeleton(false)
		}

		fetchHourData()

		return () => {
			if (skeletonTimeout) clearTimeout(skeletonTimeout)
		}
	}, [currentHour])

	// Show skeleton during SSR/hydration - use light theme as default
	const effectiveTheme = mounted ? theme : 'light'

	return (
		<main
			className={`min-h-screen overflow-x-hidden ${themeClasses.bg[effectiveTheme]} ${themeClasses.textHeading[effectiveTheme]} transition-colors duration-300`}
		>
			{/* Sticky header with breadcrumb and settings */}
			<div
				className={`z-30 ${themeClasses.bgTranslucent[effectiveTheme]} backdrop-blur-sm border-b ${themeClasses.border[effectiveTheme]}`}
			>
				<div className="max-w-4xl mx-auto px-6 py-3">
					<div className="flex items-center justify-between gap-4">
						{/* Exit button for mobile in read mode */}
						{mode === 'read' && (
							<button
								type="button"
								onClick={() => router.push('/library')}
								className="lg:hidden p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
								aria-label="Exit reading mode"
							>
								<CloseIcon className="w-5 h-5" />
							</button>
						)}
						{/* Breadcrumb with hour selector dropdown */}
						<div className="flex items-center gap-2">
							<Breadcrumb
								items={[{ label: 'Agpeya', href: '/agpeya' }]}
								theme={effectiveTheme}
								parentClassName={mode === 'read' ? 'hidden lg:flex' : undefined}
								dropdown={{
									current: currentHour,
									options: hourOptions,
									onSelect: handleHourChange,
								}}
							/>
							{/* Watch selector for midnight */}
							{currentHour === 'midnight' && (
								<div className="flex items-center gap-1 ml-2">
									{MIDNIGHT_WATCHES.map((watch) => (
										<button
											key={watch.id}
											type="button"
											onClick={() => {
												const params = new URLSearchParams(searchParams.toString())
												params.set('hour', 'midnight')
												params.set('watch', watch.id)
												router.push(`/agpeya?${params.toString()}`)
											}}
											className={`px-2 py-1 text-xs rounded transition-colors ${
												currentWatch === watch.id
													? `${themeClasses.accent[effectiveTheme]} font-medium`
													: `${themeClasses.muted[effectiveTheme]} hover:text-amber-600`
											}`}
											title={watch.theme}
										>
											W{watch.id}
										</button>
									))}
								</div>
							)}
						</div>

						{/* Collapse toggle and Display settings */}
						<div className="flex items-center gap-3 flex-shrink-0">
							<button
								type="button"
								onClick={() => setAllCollapsed(!allCollapsed)}
								className={`text-xs transition-colors hover:text-amber-600 ${themeClasses.muted[effectiveTheme]}`}
							>
								{allCollapsed ? 'Expand All' : 'Collapse All'}
							</button>
							<Suspense fallback={null}>
								<DisplaySettings />
							</Suspense>
						</div>
					</div>
				</div>
			</div>

			{/* Content */}
			<div
				className={`${getWidthClass(settings.width || 'normal')} mx-auto px-6 pt-14 pb-32 lg:pb-24`}
			>
				{error ? (
					<section className="py-24 text-center">
						<p className={themeClasses.muted[effectiveTheme]}>{error}</p>
					</section>
				) : loading && showSkeleton ? (
					<AgpeyaSkeleton theme={effectiveTheme} />
				) : hourData ? (
					<AgpeyaPrayer
						hour={hourData}
						currentWatch={currentHour === 'midnight' ? currentWatch : undefined}
						isRtl={isRtl}
						textSize={settings.textSize}
						fontFamily={settings.fontFamily}
						lineSpacing={settings.lineSpacing}
						wordSpacing={settings.wordSpacing}
						theme={effectiveTheme}
						weight={settings.weight}
						viewMode={settings.viewMode}
						allCollapsed={allCollapsed}
					/>
				) : null}
			</div>

			{/* Progress navigation */}
			{hourData && (
				<AgpeyaProgress
					theme={effectiveTheme}
					psalmsCount={
						'watches' in hourData && hourData.watches
							? hourData.watches[parseInt(currentWatch, 10) - 1]?.psalms?.length || 0
							: 'psalms' in hourData
								? hourData.psalms?.length || 0
								: 0
					}
				/>
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
			<section className="relative pt-4 pb-2 px-6">
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
