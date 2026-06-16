import type { ReadingTheme } from '@/components/DisplaySettings'
import { themeClasses } from '@/lib/reading-styles'
import type { IncenseSection } from '@/lib/types'
import { ChevronIcon } from './icons'

// Decorative Coptic textile band shown in place of a plain text notice banner; the message
// itself lives in the tooltip and accessible label.
export function NoticeBand({ notice, theme }: { notice: string; theme: ReadingTheme }) {
	return (
		<div
			role="note"
			aria-label={notice}
			title={notice}
			className={`border-b border-current/10 ${themeClasses.bg[theme]} text-amber-600/50 dark:text-amber-500/40`}
		>
			<svg className="w-full h-3.5 block" aria-hidden="true">
				<defs>
					<pattern id="coptic-band" width="28" height="14" patternUnits="userSpaceOnUse">
						<path
							d="M14 2.5 L19.5 7 L14 11.5 L8.5 7 Z"
							fill="none"
							stroke="currentColor"
							strokeWidth="1"
						/>
						<path d="M12.5 7h3M14 5.5v3" stroke="currentColor" strokeWidth="0.75" />
						<circle cx="2" cy="7" r="1" fill="currentColor" />
						<circle cx="26" cy="7" r="1" fill="currentColor" />
					</pattern>
				</defs>
				<rect width="100%" height="100%" fill="url(#coptic-band)" />
			</svg>
		</div>
	)
}

interface NavProps {
	hasPrev: boolean
	hasNext: boolean
	onPrev: () => void
	onNext: () => void
	theme: ReadingTheme
}

// Large fixed prev/next arrows pinned to the screen edges.
export function SideArrows({ hasPrev, hasNext, onPrev, onNext, theme }: NavProps) {
	const cls = `fixed top-1/2 -translate-y-1/2 z-30 p-3 rounded-full ${themeClasses.bgTranslucent[theme]} backdrop-blur-sm border ${themeClasses.border[theme]} shadow-sm transition-colors ${themeClasses.muted[theme]} hover:text-amber-600 dark:hover:text-amber-500`
	return (
		<>
			{hasPrev && (
				<button type="button" onClick={onPrev} className={`${cls} left-2`} aria-label="Previous">
					<ChevronIcon dir="left" />
				</button>
			)}
			{hasNext && (
				<button type="button" onClick={onNext} className={`${cls} right-2`} aria-label="Next">
					<ChevronIcon dir="right" />
				</button>
			)}
		</>
	)
}

interface SectionDotsProps extends NavProps {
	sections: IncenseSection[]
	sectionIndex: number
	onJump: (index: number) => void
}

// Bottom dot strip: prev/next plus one dot per section (with a hover title), the current
// section's dot elongated.
export function SectionDots({
	sections,
	sectionIndex,
	theme,
	hasPrev,
	hasNext,
	onPrev,
	onNext,
	onJump,
}: SectionDotsProps) {
	const arrowCls = `flex-shrink-0 p-1.5 rounded-lg transition-colors disabled:opacity-25 ${themeClasses.muted[theme]} hover:text-amber-600 dark:hover:text-amber-500`
	return (
		<>
			<button
				type="button"
				onClick={onPrev}
				disabled={!hasPrev}
				className={arrowCls}
				aria-label="Previous"
			>
				<ChevronIcon dir="left" />
			</button>
			<div className="flex-1 flex items-center justify-center gap-1.5 overflow-x-auto">
				{sections.map((s, i) => (
					<div key={s.id} className="group relative flex-shrink-0">
						<button
							type="button"
							onClick={() => onJump(i)}
							className="flex items-center justify-center p-2 -m-2"
							aria-label={s.title}
						>
							<span
								className={`block h-1.5 rounded-full transition-all duration-200 ${i === sectionIndex ? 'w-6 bg-amber-500' : 'w-1.5 bg-current opacity-20 group-hover:opacity-40'}`}
							/>
						</button>
						<div
							className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-2 py-1 rounded text-xs whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50 ${themeClasses.bg[theme]} ${themeClasses.textHeading[theme]} border ${themeClasses.border[theme]} shadow-md`}
						>
							{s.title}
						</div>
					</div>
				))}
			</div>
			<button
				type="button"
				onClick={onNext}
				disabled={!hasNext}
				className={arrowCls}
				aria-label="Next"
			>
				<ChevronIcon dir="right" />
			</button>
		</>
	)
}
