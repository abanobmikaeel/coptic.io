import { themeClasses } from '@/lib/reading-styles'
import { ChevronIcon } from './ChevronIcon'
import type { HeaderProps } from './types'

export function LtrHeader({ title, reference, service, isOpen, theme }: HeaderProps) {
	return (
		<div
			className={`py-4 px-4 border-l-4 border-amber-500/60 transition-all ${themeClasses.cardBg[theme]}`}
		>
			{service && (
				<p
					className={`text-[10px] font-semibold tracking-widest uppercase mb-2 ${themeClasses.muted[theme]}`}
				>
					{service}
				</p>
			)}
			<div className="flex items-center justify-between">
				<div>
					<h2
						className={`text-2xl font-bold ${themeClasses.text[theme]} group-hover:text-amber-600 transition-colors`}
					>
						{title}
					</h2>
					<p
						className={`text-base mt-1 ${theme === 'sepia' ? 'text-amber-700' : 'text-amber-600/80'}`}
					>
						{reference}
					</p>
				</div>
				<ChevronIcon isOpen={isOpen} theme={theme} rotate="left" />
			</div>
		</div>
	)
}
