'use client'

import { useEffect, useState } from 'react'
import type { ThemeStyles } from './types'

interface CollapsibleSectionProps {
	title: string
	subtitle?: string
	themeStyles: ThemeStyles
	defaultOpen?: boolean
	forceCollapsed?: boolean
	children: React.ReactNode
}

export function CollapsibleSection({
	title,
	subtitle,
	themeStyles,
	defaultOpen = true,
	forceCollapsed,
	children,
}: CollapsibleSectionProps) {
	const [isOpen, setIsOpen] = useState(defaultOpen)

	// Sync with forceCollapsed when it changes
	useEffect(() => {
		if (forceCollapsed !== undefined) {
			setIsOpen(!forceCollapsed)
		}
	}, [forceCollapsed])

	return (
		<article>
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				className="w-full group cursor-pointer"
			>
				<div
					className={`flex items-center justify-between py-4 pl-4 pr-4 border-l-4 border-amber-500/60 transition-all ${themeStyles.cardBg}`}
				>
					<div className="text-left">
						<h2 className={`text-base font-semibold uppercase tracking-wide ${themeStyles.muted}`}>
							{title}
							{subtitle && (
								<span
									className={`ml-2 text-sm font-normal normal-case tracking-normal ${themeStyles.muted}`}
								>
									{subtitle}
								</span>
							)}
						</h2>
					</div>
					<svg
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						className={`${themeStyles.muted} transition-transform flex-shrink-0 ${isOpen ? '' : '-rotate-90'}`}
						aria-hidden="true"
					>
						<path d="m6 9 6 6 6-6" />
					</svg>
				</div>
			</button>

			{isOpen && <div className="mt-6">{children}</div>}
		</article>
	)
}
