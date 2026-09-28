'use client'

import type { ReadingTheme } from '@/components/DisplaySettings'
import { SectionListOverlay, TocIcon } from '@/components/LiturgicalSection'
import { findActiveReading, scrollToReading } from '@/hooks/useActiveReading'
import type { AvailableSections } from '@/lib/reading-sections'
import { themeClasses } from '@/lib/reading-styles'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { RemoveScroll } from 'react-remove-scroll'

interface ReadingsSectionMenuProps {
	sections: AvailableSections
	theme: ReadingTheme
}

// The prayer readers' section list, for the readings page: jump to any reading, grouped by service.
export function ReadingsSectionMenu({ sections, theme }: Readonly<ReadingsSectionMenuProps>) {
	// The reading in view when the list was opened; null while closed.
	const [openAt, setOpenAt] = useState<number | null>(null)
	const { allReadings } = sections

	useEffect(() => {
		if (openAt === null) return
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') setOpenAt(null)
		}
		window.addEventListener('keydown', onKey)
		return () => window.removeEventListener('keydown', onKey)
	}, [openAt])

	if (allReadings.length === 0) return null

	const open = () => {
		const active = findActiveReading(allReadings)
		setOpenAt(allReadings.findIndex((r) => r.key === active))
	}

	const jump = (index: number) => {
		setOpenAt(null)
		scrollToReading(allReadings[index].key)
	}

	const items = sections.groups.flatMap((group) =>
		group.readings.map((r) => ({ id: r.key, title: r.label, group: group.label })),
	)

	return (
		<>
			<button
				type="button"
				onClick={open}
				title="Sections"
				aria-label="Sections"
				className={`p-1.5 rounded-md transition-colors ${themeClasses.muted[theme]} hover:text-amber-600 dark:hover:text-amber-500`}
			>
				<TocIcon />
			</button>
			{/* Portalled out of the sticky header, whose stacking context would sit it under the navbar */}
			{openAt !== null &&
				createPortal(
					<RemoveScroll>
						<SectionListOverlay
							sections={items}
							activeIndex={openAt}
							theme={theme}
							onJump={jump}
							onClose={() => setOpenAt(null)}
						/>
					</RemoveScroll>,
					document.body,
				)}
		</>
	)
}
