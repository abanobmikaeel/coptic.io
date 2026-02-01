'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

export type AgpeyaHour = 'prime' | 'terce' | 'sext' | 'none' | 'vespers' | 'compline' | 'midnight'
export type MidnightWatch = '1' | '2' | '3'

export interface HourInfo {
	id: AgpeyaHour
	name: string
	englishName: string
	traditionalTime: string
	startHour: number
	endHour: number
}

export interface WatchInfo {
	id: MidnightWatch
	name: string
	theme: string
}

export const AGPEYA_HOURS: HourInfo[] = [
	{
		id: 'prime',
		name: 'Prime',
		englishName: 'Morning Prayer',
		traditionalTime: '6am',
		startHour: 6,
		endHour: 9,
	},
	{
		id: 'terce',
		name: 'Terce',
		englishName: 'Third Hour',
		traditionalTime: '9am',
		startHour: 9,
		endHour: 12,
	},
	{
		id: 'sext',
		name: 'Sext',
		englishName: 'Sixth Hour',
		traditionalTime: '12pm',
		startHour: 12,
		endHour: 15,
	},
	{
		id: 'none',
		name: 'None',
		englishName: 'Ninth Hour',
		traditionalTime: '3pm',
		startHour: 15,
		endHour: 18,
	},
	{
		id: 'vespers',
		name: 'Vespers',
		englishName: 'Eleventh Hour',
		traditionalTime: '6pm',
		startHour: 18,
		endHour: 21,
	},
	{
		id: 'compline',
		name: 'Compline',
		englishName: 'Twelfth Hour',
		traditionalTime: '9pm',
		startHour: 21,
		endHour: 24,
	},
	{
		id: 'midnight',
		name: 'Midnight',
		englishName: 'Three Watches',
		traditionalTime: '12am',
		startHour: 0,
		endHour: 6,
	},
]

export const MIDNIGHT_WATCHES: WatchInfo[] = [
	{ id: '1', name: 'First Watch', theme: 'Confession and Repentance' },
	{ id: '2', name: 'Second Watch', theme: 'Vigilance and Preparation' },
	{ id: '3', name: 'Third Watch', theme: 'Resurrection Hope' },
]

export function getCurrentHour(): AgpeyaHour {
	const currentHour = new Date().getHours()

	for (const hour of AGPEYA_HOURS) {
		if (hour.id === 'midnight') {
			if (currentHour >= 0 && currentHour < hour.endHour) {
				return hour.id
			}
		} else if (currentHour >= hour.startHour && currentHour < hour.endHour) {
			return hour.id
		}
	}

	return 'prime'
}

export function getHourInfo(hourId: AgpeyaHour): HourInfo {
	return AGPEYA_HOURS.find((h) => h.id === hourId) || AGPEYA_HOURS[0]
}

export function getWatchInfo(watchId: MidnightWatch): WatchInfo {
	return MIDNIGHT_WATCHES.find((w) => w.id === watchId) || MIDNIGHT_WATCHES[0]
}

interface AgpeyaHourSelectorProps {
	currentHour: AgpeyaHour
	currentWatch?: MidnightWatch
	recommendedHour?: AgpeyaHour
	theme?: 'light' | 'sepia' | 'dark'
}

export function AgpeyaHourSelector({
	currentHour,
	currentWatch,
	recommendedHour,
	theme = 'light',
}: AgpeyaHourSelectorProps) {
	const router = useRouter()
	const searchParams = useSearchParams()
	const [isOpen, setIsOpen] = useState(false)
	const dropdownRef = useRef<HTMLDivElement>(null)

	const handleHourChange = useCallback(
		(hourId: AgpeyaHour, watchId?: MidnightWatch) => {
			const params = new URLSearchParams(searchParams.toString())
			params.set('hour', hourId)
			if (hourId === 'midnight' && watchId) {
				params.set('watch', watchId)
			} else {
				params.delete('watch')
			}
			router.push(`/agpeya?${params.toString()}`)
			setIsOpen(false)
		},
		[router, searchParams],
	)

	const handleWatchChange = useCallback(
		(watchId: MidnightWatch) => {
			const params = new URLSearchParams(searchParams.toString())
			params.set('hour', 'midnight')
			params.set('watch', watchId)
			router.push(`/agpeya?${params.toString()}`)
		},
		[router, searchParams],
	)

	// Close dropdown when clicking outside
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsOpen(false)
			}
		}

		if (isOpen) {
			document.addEventListener('mousedown', handleClickOutside)
			return () => document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [isOpen])

	// Close on escape key
	useEffect(() => {
		function handleEscape(event: KeyboardEvent) {
			if (event.key === 'Escape') {
				setIsOpen(false)
			}
		}

		if (isOpen) {
			document.addEventListener('keydown', handleEscape)
			return () => document.removeEventListener('keydown', handleEscape)
		}
	}, [isOpen])

	const currentHourInfo = getHourInfo(currentHour)
	const isRecommended = currentHour === recommendedHour

	const themeStyles = {
		light: {
			pillBg: 'bg-white',
			pillBorder: 'border-gray-200',
			pillText: 'text-gray-900',
			pillHover: 'hover:bg-gray-50',
			dropdownBg: 'bg-white',
			dropdownBorder: 'border-gray-200',
			itemText: 'text-gray-700',
			itemHover: 'hover:bg-gray-50',
			activeText: 'text-amber-700',
			activeBg: 'bg-amber-50',
			mutedText: 'text-gray-500',
			recommendedBg: 'bg-amber-100',
			recommendedText: 'text-amber-700',
		},
		sepia: {
			pillBg: 'bg-[#f5f0e6]',
			pillBorder: 'border-[#d4c9b8]',
			pillText: 'text-[#5c4a32]',
			pillHover: 'hover:bg-[#ebe4d6]',
			dropdownBg: 'bg-[#f5f0e6]',
			dropdownBorder: 'border-[#d4c9b8]',
			itemText: 'text-[#5c4a32]',
			itemHover: 'hover:bg-[#ebe4d6]',
			activeText: 'text-amber-800',
			activeBg: 'bg-amber-100/50',
			mutedText: 'text-[#8b7355]',
			recommendedBg: 'bg-amber-100/70',
			recommendedText: 'text-amber-800',
		},
		dark: {
			pillBg: 'bg-gray-800',
			pillBorder: 'border-gray-700',
			pillText: 'text-gray-100',
			pillHover: 'hover:bg-gray-700',
			dropdownBg: 'bg-gray-800',
			dropdownBorder: 'border-gray-700',
			itemText: 'text-gray-300',
			itemHover: 'hover:bg-gray-700',
			activeText: 'text-amber-400',
			activeBg: 'bg-amber-900/30',
			mutedText: 'text-gray-500',
			recommendedBg: 'bg-amber-900/40',
			recommendedText: 'text-amber-400',
		},
	}

	const styles = themeStyles[theme]
	const isMidnight = currentHour === 'midnight'

	return (
		<div className="flex items-center gap-2">
			<div className="relative" ref={dropdownRef}>
				{/* Collapsed pill button */}
				<button
					type="button"
					onClick={() => setIsOpen(!isOpen)}
					className={`
						flex items-center gap-2 px-4 py-2.5 rounded-full border transition-all
						${styles.pillBg} ${styles.pillBorder} ${styles.pillText} ${styles.pillHover}
						${isOpen ? 'ring-2 ring-amber-500/30' : ''}
					`}
				>
					<span className="font-semibold">{currentHourInfo.name}</span>
					<span className={`text-sm ${styles.mutedText}`}>·</span>
					<span className={`text-sm ${styles.mutedText}`}>{currentHourInfo.traditionalTime}</span>
					{isRecommended && (
						<span
							className={`ml-1 px-1.5 py-0.5 text-[10px] font-medium rounded ${styles.recommendedBg} ${styles.recommendedText}`}
						>
							NOW
						</span>
					)}
					<svg
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						className={`ml-1 transition-transform ${isOpen ? 'rotate-180' : ''} ${styles.mutedText}`}
						aria-hidden="true"
					>
						<path d="m6 9 6 6 6-6" />
					</svg>
				</button>

				{/* Dropdown */}
				{isOpen && (
					<div
						className={`
							absolute top-full left-0 mt-2 py-1 min-w-[200px] rounded-lg border shadow-lg z-50
							${styles.dropdownBg} ${styles.dropdownBorder}
						`}
					>
						{AGPEYA_HOURS.map((hour) => {
							const isActive = currentHour === hour.id
							const isHourRecommended = recommendedHour === hour.id

							return (
								<button
									key={hour.id}
									type="button"
									onClick={() => handleHourChange(hour.id, hour.id === 'midnight' ? '1' : undefined)}
									className={`
										w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors
										${isActive ? `${styles.activeBg} ${styles.activeText}` : `${styles.itemText} ${styles.itemHover}`}
									`}
								>
									{/* Check mark for current selection */}
									<span className="w-4">
										{isActive && (
											<svg
												width="16"
												height="16"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												strokeWidth="2.5"
												aria-hidden="true"
											>
												<polyline points="20 6 9 17 4 12" />
											</svg>
										)}
									</span>

									<div className="flex-1">
										<div className="flex items-center gap-2">
											<span className={`font-medium ${isActive ? styles.activeText : ''}`}>
												{hour.name}
											</span>
											{isHourRecommended && !isActive && (
												<span
													className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${styles.recommendedBg} ${styles.recommendedText}`}
												>
													NOW
												</span>
											)}
										</div>
										<span className={`text-xs ${styles.mutedText}`}>
											{hour.englishName} · {hour.traditionalTime}
										</span>
									</div>
								</button>
							)
						})}
					</div>
				)}
			</div>

			{/* Watch selector - shown when midnight is selected */}
			{isMidnight && (
				<div className="flex items-center gap-1">
					{MIDNIGHT_WATCHES.map((watch) => {
						const isActiveWatch = currentWatch === watch.id
						return (
							<button
								key={watch.id}
								type="button"
								onClick={() => handleWatchChange(watch.id)}
								className={`
									px-3 py-1.5 text-sm rounded-full border transition-all
									${
										isActiveWatch
											? `${styles.activeBg} ${styles.activeText} border-amber-500/50`
											: `${styles.pillBg} ${styles.pillBorder} ${styles.itemText} ${styles.pillHover}`
									}
								`}
								title={watch.theme}
							>
								{watch.id}
							</button>
						)
					})}
				</div>
			)}
		</div>
	)
}
