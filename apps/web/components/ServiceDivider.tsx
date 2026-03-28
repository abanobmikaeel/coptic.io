import type { ReadingTheme } from '@/lib/reading-preferences'
import { themeClasses } from '@/lib/reading-styles'

const serviceDescriptions: Record<string, string> = {
	Vespers: 'Evening Service',
	Matins: 'Morning Service',
	'Evening Prayer': 'Evening Prayer Service',
}

interface ServiceDividerProps {
	label: string
	theme: ReadingTheme
}

export function ServiceDivider({ label, theme }: ServiceDividerProps) {
	return (
		<div className="max-w-full sm:max-w-2xl mx-auto my-12">
			<div className="flex items-center gap-4">
				<div className={`flex-1 border-t ${themeClasses.border[theme]}`} />
				<div className="text-center">
					<span
						className={`block text-xs font-semibold tracking-widest uppercase ${themeClasses.muted[theme]}`}
					>
						{label}
					</span>
					{serviceDescriptions[label] && (
						<span className={`block text-[10px] mt-0.5 ${themeClasses.muted[theme]} opacity-70`}>
							{serviceDescriptions[label]}
						</span>
					)}
				</div>
				<div className={`flex-1 border-t ${themeClasses.border[theme]}`} />
			</div>
		</div>
	)
}
