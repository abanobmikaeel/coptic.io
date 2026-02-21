import { themeClasses } from '@/lib/reading-styles'
import { ChevronIcon } from './ChevronIcon'
import type { HeaderProps } from './types'

export function RtlHeader({ title, reference, service, isOpen, theme }: HeaderProps) {
	return (
		<div
			className={`border-r-4 border-amber-500/60 transition-all ${themeClasses.cardBg[theme]}`}
			dir="rtl"
		>
			<div className="py-1.5 pr-2 pl-1 sm:px-0 flex items-center justify-between">
				<div>
					{service && (
						<p className={`text-[10px] font-semibold ${themeClasses.muted[theme]} font-arabic`}>
							{service}
						</p>
					)}
					<h2
						className={`text-sm font-bold ${themeClasses.text[theme]} group-hover:text-amber-600 transition-colors font-arabic leading-tight`}
					>
						{title}
					</h2>
					<p
						className={`text-xs ${theme === 'sepia' ? 'text-amber-700' : 'text-amber-600/80'} font-arabic leading-tight`}
					>
						{reference}
					</p>
				</div>
				<ChevronIcon isOpen={isOpen} theme={theme} rotate="right" />
			</div>
		</div>
	)
}
