import type { ReadingTheme } from '@/components/DisplaySettings'
import { themeClasses } from '@/lib/reading-styles'
import type { IncenseSection } from '@/lib/types'
import { CheckIcon, CloseIcon, PlusIcon } from './icons'

export interface SectionListOverlayProps {
	// Visible sections (service flow), and the optional ones offered as "additional prayers".
	sections: IncenseSection[]
	optionalSections: IncenseSection[]
	activeIndex: number
	// Ids of optional sections the user has added.
	extras: string[]
	theme: ReadingTheme
	onJump: (index: number) => void
	onToggleExtra: (id: string) => void
	onClose: () => void
}

// Modal overlay listing every section (jump to any) plus the optional "additional prayers"
// a user can fold into the service. Pure presentation — all state lives in the reader.
export function SectionListOverlay({
	sections,
	optionalSections,
	activeIndex,
	extras,
	theme,
	onJump,
	onToggleExtra,
	onClose,
}: SectionListOverlayProps) {
	return (
		<div
			// biome-ignore lint/a11y/useSemanticElements: controlled modal overlay with a custom backdrop, not a native <dialog>
			role="dialog"
			aria-modal="true"
			aria-label="Sections"
			className="fixed inset-0 z-[80] flex items-start justify-center p-4 sm:p-8"
		>
			<button
				type="button"
				aria-label="Close sections"
				className="absolute inset-0 bg-black/40 backdrop-blur-sm"
				onClick={onClose}
			/>
			<div
				className={`relative mt-16 w-full max-w-md max-h-[70vh] overflow-y-auto rounded-xl border shadow-2xl ${themeClasses.border[theme]} ${themeClasses.bg[theme]}`}
			>
				<div
					className={`sticky top-0 px-4 py-3 border-b ${themeClasses.border[theme]} ${themeClasses.bg[theme]} flex items-center justify-between`}
				>
					<span className={`text-sm font-semibold ${themeClasses.textHeading[theme]}`}>
						Sections
					</span>
					<button
						type="button"
						onClick={onClose}
						className={`p-1 rounded ${themeClasses.muted[theme]} hover:text-amber-600 dark:hover:text-amber-500`}
						aria-label="Close"
					>
						<CloseIcon />
					</button>
				</div>
				<ul className="py-1">
					{sections.map((s, i) => (
						<li key={s.id}>
							<button
								type="button"
								onClick={() => onJump(i)}
								className={`w-full text-left px-4 py-2.5 flex items-center gap-3 transition-colors ${
									i === activeIndex
										? `bg-amber-500/10 ${themeClasses.textHeading[theme]}`
										: `${themeClasses.text[theme]} hover:bg-current/5`
								}`}
							>
								<span
									className={`text-xs font-mono tabular-nums w-5 flex-shrink-0 ${i === activeIndex ? 'text-amber-500' : themeClasses.muted[theme]}`}
								>
									{i + 1}
								</span>
								<span className="text-sm">{s.title}</span>
								{s.optional && (
									<span
										className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border border-current/20 flex-shrink-0 ${themeClasses.muted[theme]}`}
									>
										added
									</span>
								)}
								{i === activeIndex && (
									<span className="ml-auto block w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
								)}
							</button>
						</li>
					))}
				</ul>
				{optionalSections.length > 0 && (
					<>
						<div className={`px-4 pt-3 pb-1 border-t ${themeClasses.border[theme]}`}>
							<p
								className={`text-xs font-semibold uppercase tracking-wider ${themeClasses.muted[theme]}`}
							>
								Additional prayers
							</p>
							<p className={`text-xs mt-0.5 ${themeClasses.muted[theme]}`}>
								Not part of today's service — tap to add.
							</p>
						</div>
						<ul className="py-1">
							{optionalSections.map((s) => {
								const enabled = extras.includes(s.id)
								return (
									<li key={s.id}>
										<button
											type="button"
											onClick={() => onToggleExtra(s.id)}
											aria-pressed={enabled}
											className={`w-full text-left px-4 py-2.5 flex items-center gap-3 transition-colors ${themeClasses.text[theme]} hover:bg-current/5`}
										>
											<span
												className={`w-5 flex-shrink-0 flex items-center justify-center ${enabled ? 'text-amber-500' : themeClasses.muted[theme]}`}
											>
												{enabled ? <CheckIcon /> : <PlusIcon />}
											</span>
											<span className="min-w-0">
												<span className="block text-sm">{s.title}</span>
												{s.rubric && (
													<span className={`block text-xs mt-0.5 ${themeClasses.muted[theme]}`}>
														{s.rubric}
													</span>
												)}
											</span>
										</button>
									</li>
								)
							})}
						</ul>
					</>
				)}
			</div>
		</div>
	)
}
