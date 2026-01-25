'use client'

import { getFastColors } from '@/constants'

interface FastingLegendProps {
	visibleFasts: Set<string>
}

export function FastingLegend({ visibleFasts }: FastingLegendProps) {
	if (visibleFasts.size === 0) return null

	return (
		<div className="flex flex-wrap gap-6 justify-center mt-2">
			{Array.from(visibleFasts).map((fast) => {
				const colors = getFastColors(fast)
				if (!colors) return null
				return (
					<div key={fast} className="flex items-center gap-2.5">
						<div
							className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${colors.bg} ${colors.darkBg} ${colors.text} ${colors.darkText}`}
						>
							{colors.icon}
						</div>
						<span className="text-base text-gray-700 dark:text-gray-300 font-medium">{fast}</span>
					</div>
				)
			})}
		</div>
	)
}
