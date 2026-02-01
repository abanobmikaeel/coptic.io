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

	if (!mounted) {
		return null
	}

	return (
		<main
			className={`min-h-screen ${themeClasses.bg[theme]} ${themeClasses.textHeading[theme]} transition-colors duration-300`}
		>
			{/* Header */}
			<section className="relative pt-20 pb-4 px-6">
				<div className="max-w-4xl mx-auto">
					<Breadcrumb items={[{ label: 'Agpeya' }]} />
				</div>
			</section>

			{/* Sticky header with hour selector and settings */}
			<div
				className={`sticky top-14 z-30 ${themeClasses.bgTranslucent[theme]} backdrop-blur-sm border-b ${themeClasses.border[theme]}`}
			>
				<div className="max-w-4xl mx-auto px-6 py-3">
					<div className="flex items-center justify-between gap-4">
						{/* Hour selector (collapsed dropdown) */}
						<Suspense fallback={null}>
							<AgpeyaHourSelector
								currentHour={currentHour}
								recommendedHour={recommendedHour}
								theme={theme}
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
				{loading ? (
					<div className="flex justify-center py-24">
						<div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
					</div>
				) : error ? (
					<section className="py-24 text-center">
						<p className={themeClasses.muted[theme]}>{error}</p>
					</section>
				) : hourData ? (
					<AgpeyaPrayer
						hour={hourData}
						isRtl={isRtl}
						textSize={settings.textSize}
						fontFamily={settings.fontFamily}
						lineSpacing={settings.lineSpacing}
						wordSpacing={settings.wordSpacing}
						theme={theme}
						weight={settings.weight}
					/>
				) : null}
			</div>

			{/* Progress navigation */}
			{hourData && <AgpeyaProgress theme={theme} psalmsCount={hourData.psalms?.length || 0} />}

			{/* Back to top - hidden on mobile since we have progress nav */}
			<div className="hidden lg:block">
				<BackToTop />
			</div>
		</main>
	)
}

export default function AgpeyaPage() {
	return (
		<Suspense
			fallback={
				<div className="min-h-screen flex items-center justify-center">
					<div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
				</div>
			}
		>
			<AgpeyaContent />
		</Suspense>
	)
}
