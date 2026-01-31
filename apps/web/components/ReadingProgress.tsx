'use client'

import { useEffect, useRef, useState } from 'react'

export function ReadingProgress() {
	const [progress, setProgress] = useState(0)
	const [isVisible, setIsVisible] = useState(false)
	const rafRef = useRef<number | null>(null)
	const lastProgressRef = useRef(0)

	useEffect(() => {
		const handleScroll = () => {
			// Cancel any pending animation frame
			if (rafRef.current) {
				cancelAnimationFrame(rafRef.current)
			}

			// Use requestAnimationFrame to throttle updates
			rafRef.current = requestAnimationFrame(() => {
				const scrollTop = window.scrollY
				const docHeight = document.documentElement.scrollHeight - window.innerHeight
				const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
				const clampedProgress = Math.min(100, Math.max(0, scrollPercent))

				// Only update if change is significant (> 0.5%)
				if (Math.abs(clampedProgress - lastProgressRef.current) > 0.5) {
					lastProgressRef.current = clampedProgress
					setProgress(clampedProgress)
				}

				setIsVisible(scrollTop > 200)
			})
		}

		window.addEventListener('scroll', handleScroll, { passive: true })
		handleScroll()

		return () => {
			window.removeEventListener('scroll', handleScroll)
			if (rafRef.current) {
				cancelAnimationFrame(rafRef.current)
			}
		}
	}, [])

	if (!isVisible) return null

	const roundedProgress = Math.round(progress)

	return (
		<>
			{/* Progress bar at top */}
			<div className="fixed top-14 left-0 right-0 z-40 h-0.5 bg-gray-200/50 dark:bg-gray-800/50">
				<div
					className="h-full bg-amber-500"
					style={{
						width: `${progress}%`,
						transition: 'width 100ms linear',
						willChange: 'width',
					}}
				/>
			</div>

			{/* Floating progress indicator */}
			<div className="fixed bottom-24 left-6 z-40 flex items-center gap-2 px-3 py-2 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-600 dark:text-gray-300">
				<svg className="w-4 h-4" viewBox="0 0 36 36" aria-hidden="true">
					<path
						className="text-gray-200 dark:text-gray-700"
						stroke="currentColor"
						strokeWidth="3"
						fill="none"
						d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
					/>
					<path
						className="text-amber-500"
						stroke="currentColor"
						strokeWidth="3"
						strokeLinecap="round"
						fill="none"
						style={{
							strokeDasharray: `${progress}, 100`,
							transition: 'stroke-dasharray 100ms linear',
						}}
						d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
					/>
				</svg>
				<span className="tabular-nums w-8">{roundedProgress}%</span>
			</div>
		</>
	)
}
