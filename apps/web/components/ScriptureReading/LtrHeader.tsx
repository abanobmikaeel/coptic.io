import { themeClasses } from '@/lib/reading-styles'
import { ChevronIcon } from './ChevronIcon'
import type { HeaderProps } from './types'

export function LtrHeader({ title, reference, service, isOpen, theme }: HeaderProps) {
	return (
		<div className={`border-l-4 border-amber-500/60 transition-all ${themeClasses.cardBg[theme]}`}>
			<div className="py-2.5 pl-2 pr-1 sm:px-0 flex items-center justify-between">
				<div>
					{service && (
						<p
							className={`text-xs font-semibold tracking-widest uppercase ${themeClasses.muted[theme]}`}
						>
							{service}
						</p>
					)}
					<h2
						className={`text-base font-bold ${themeClasses.text[theme]} group-hover:text-amber-600 transition-colors leading-tight`}
					>
						{title}
					</h2>
					<p
						className={`text-sm ${theme === 'sepia' ? 'text-amber-700' : 'text-amber-600/80'} leading-tight`}
					>
						{reference}
					</p>
				</div>
				<ChevronIcon isOpen={isOpen} theme={theme} rotate="left" />
			</div>
		</div>
	)
}
