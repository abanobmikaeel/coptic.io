import type { ReadingTheme } from '@/components/DisplaySettings'
import { themeClasses } from '@/lib/reading-styles'

const WEEKS = [1, 2, 3, 4]

interface TasbehaKiahkOptionProps {
	theme: ReadingTheme
	isArabic: boolean
	isSaturday: boolean
	/** The displayed service is the Kiahk Psalmody, by date or by request. */
	isKiahk: boolean
	/** The week asked for in the URL, when the date is not choosing it. */
	week?: number
	onSelect: (week: number | null) => void
}

/** The day menu's way into the Kiahk Psalmody when the date has not brought it. */
export function TasbehaKiahkOption({
	theme,
	isArabic,
	isSaturday,
	isKiahk,
	week,
	onSelect,
}: Readonly<TasbehaKiahkOptionProps>) {
	if (isKiahk && !week) return null

	const optionClass = `w-full text-start px-4 py-2 text-[13px] transition-colors ${themeClasses.dropdownText[theme]}`

	return (
		<div className="mt-1.5 pt-1.5 border-t border-current/10">
			{week ? (
				<button type="button" onClick={() => onSelect(null)} className={optionClass}>
					{isArabic ? 'الموسم الحالي' : 'Current season'}
				</button>
			) : (
				<button
					type="button"
					onClick={() => onSelect(WEEKS[0] as number)}
					className={`flex flex-col items-start ${optionClass}`}
				>
					<span>{isArabic ? 'تسبحة كيهك' : 'Kiahk Psalmody'}</span>
					<span className={`text-[10px] ${themeClasses.dropdownMuted[theme]}`}>
						{isArabic ? 'جزئي' : 'Partial'}
					</span>
				</button>
			)}
			{/* The Saturday Praise is the only service with an exposition for each week. */}
			{week && isSaturday && (
				<div className="flex gap-1 px-3 pt-1 pb-0.5">
					{WEEKS.map((option) => (
						<button
							key={option}
							type="button"
							onClick={() => onSelect(option)}
							aria-label={isArabic ? `الأسبوع ${option}` : `Week ${option}`}
							aria-pressed={option === week}
							className={`flex-1 rounded-md py-1 text-xs transition-colors ${
								option === week
									? themeClasses.dropdownActiveText[theme]
									: themeClasses.dropdownText[theme]
							}`}
						>
							{option}
						</button>
					))}
				</div>
			)}
		</div>
	)
}
