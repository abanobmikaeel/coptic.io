'use client'

import { ChevronLeftIcon, ChevronRightIcon } from '@/components/ui/Icons'

interface SynaxariumDateNavProps {
	currentDate: string
	displayDate: string
	isToday: boolean
	onPrevious: () => void
	onNext: () => void
	onGoToToday: () => void
}

export function SynaxariumDateNav({
	displayDate,
	isToday,
	onPrevious,
	onNext,
	onGoToToday,
}: SynaxariumDateNavProps) {
	return (
		<section className="relative px-6 pb-6">
			<div className="max-w-4xl mx-auto">
				<div className="flex items-center justify-between">
					<button
						type="button"
						onClick={onPrevious}
						aria-label="Previous day"
						className="p-3 min-w-[48px] min-h-[48px] flex items-center justify-center rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700 transition-colors"
					>
						<ChevronLeftIcon className="w-6 h-6" />
					</button>

					<div className="flex items-center gap-3">
						{!isToday && (
							<button
								type="button"
								onClick={onGoToToday}
								className="px-4 py-2 text-sm font-semibold rounded-lg bg-amber-700 hover:bg-amber-600 text-white shadow-sm hover:shadow transition-all"
							>
								Today
							</button>
						)}
						<div className="text-center">
							<p className="text-lg font-semibold text-gray-900 dark:text-white">{displayDate}</p>
							{isToday && <p className="text-sm text-amber-600 dark:text-amber-500">Today</p>}
						</div>
					</div>

					<button
						type="button"
						onClick={onNext}
						aria-label="Next day"
						className="p-3 min-w-[48px] min-h-[48px] flex items-center justify-center rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700 transition-colors"
					>
						<ChevronRightIcon className="w-6 h-6" />
					</button>
				</div>
			</div>
		</section>
	)
}
