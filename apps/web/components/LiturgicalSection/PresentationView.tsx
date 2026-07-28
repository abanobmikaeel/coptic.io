'use client'

import type { ReadingTheme } from '@/components/DisplaySettings'
import type {
	FontFamily,
	FontWeight,
	LineSpacing,
	TextSize,
	WordSpacing,
} from '@/components/DisplaySettings'
import type { BibleTranslation } from '@/components/ScriptureReading/types'
import type { ViewMode } from '@/lib/reading-preferences'
import {
	forwardRef,
	useEffect,
	useImperativeHandle,
	useLayoutEffect,
	useRef,
	useState,
} from 'react'
import { Row } from './Row'
import { LanguageColumnsHeader } from './ServiceSection'
import type { AlignedRow } from './align'
import { computeFixedPageBreaks, computePageBreaks } from './pagination'

export interface PresentationViewHandle {
	next: () => void
	prev: () => void
}

interface PresentationViewProps {
	rows: AlignedRow[]
	activeLangs: BibleTranslation[]
	theme: ReadingTheme
	textSize: TextSize
	fontFamily: FontFamily
	lineSpacing: LineSpacing
	wordSpacing: WordSpacing
	weight: FontWeight
	viewMode?: ViewMode
	showVerses?: boolean
	contentLayout?: 'prose' | 'stanzas'
	// Called when paging past the last/first page — parent advances to the adjacent section.
	onExitNext: () => void
	onExitPrev: () => void
	onPaginationChange?: (pageIndex: number, pageCount: number) => void
	// 'last' lands on the final page once measured — for PowerPoint-style backward entry
	// (paging left out of a section into the end of the previous one).
	initialPage?: 'first' | 'last'
	rowsPerPage?: number
}

// Reserve from the measured viewport: pt-2 (8px) above + a little breathing room below.
const PAGE_VERTICAL_RESERVE = 20

// Owns presentation-mode pagination for one section. The section is a list of
// aligned rows shared by every language column; pages are contiguous row
// ranges, so every language is always on the same page by construction. The
// hidden measurer renders all rows at the real width, each row's height is
// read back, and rows are binned into screen-sized pages.
// Remount per section (via `key`) to reset to the first page.
export const PresentationView = forwardRef<PresentationViewHandle, PresentationViewProps>(
	function PresentationView(
		{
			rows,
			activeLangs,
			onExitNext,
			onExitPrev,
			onPaginationChange,
			initialPage = 'first',
			rowsPerPage,
			...style
		},
		ref,
	) {
		const viewRef = useRef<HTMLDivElement>(null)
		const measureRef = useRef<HTMLDivElement>(null)
		const [breaks, setBreaks] = useState<number[] | null>(null)
		const [pageIndex, setPageIndex] = useState(0)
		// The measurer is a client-only device — never ship its duplicate in the SSR payload.
		const [isClient, setIsClient] = useState(false)
		useEffect(() => setIsClient(true), [])

		const styleSig = `${style.textSize}|${style.lineSpacing}|${style.fontFamily}|${style.weight}|${style.wordSpacing}|${style.viewMode}|${style.showVerses}|${style.contentLayout}|${rowsPerPage}`
		const langsSig = activeLangs.join('|')

		// Measure rendered row heights → compute page breaks. Runs before paint (no
		// flicker). styleSig/langsSig/isClient aren't all used inside `measure` but are
		// intentional re-measure triggers: settings and the client-only measurer mount
		// change the DOM heights we read.
		// biome-ignore lint/correctness/useExhaustiveDependencies: intentional re-measure triggers
		useLayoutEffect(() => {
			const measure = () => {
				const view = viewRef.current
				const container = measureRef.current
				if (!view || !container) return

				const rowEls = Array.from(container.children) as HTMLElement[]
				const rowHeights = rowEls.map((el, i) => {
					const top = el.getBoundingClientRect().top
					const nextTop = rowEls[i + 1]?.getBoundingClientRect().top
					return nextTop != null ? nextTop - top : el.getBoundingClientRect().height
				})
				const languageHeaderReserve = style.contentLayout === 'stanzas' ? 28 : 0
				const available = view.clientHeight - PAGE_VERTICAL_RESERVE - languageHeaderReserve
				setBreaks(
					rowsPerPage
						? computeFixedPageBreaks(rows.length, rowsPerPage)
						: computePageBreaks(
								rowHeights,
								available,
								rows.map((row) => row.isRubric),
							),
				)
			}

			measure()
			const ro = new ResizeObserver(measure)
			if (viewRef.current) ro.observe(viewRef.current)
			document.fonts?.ready.then(measure).catch(() => {})
			return () => ro.disconnect()
		}, [rows, styleSig, langsSig, isClient])

		const pageCount = Math.max(1, (breaks?.length ?? 2) - 1)

		// PowerPoint-style backward entry: pin to the last page. Re-applies on every re-measure
		// (e.g. fonts loading can change the page count) until the user actually navigates.
		const userNavigated = useRef(false)
		useLayoutEffect(() => {
			if (initialPage === 'last' && !userNavigated.current && breaks != null) {
				setPageIndex(pageCount - 1)
			}
		}, [initialPage, pageCount, breaks])

		const safePage = Math.min(pageIndex, pageCount - 1)

		// A page can still exceed the viewport when a single row (e.g. one long verse
		// on a narrow column) is taller than the screen — the view scrolls rather than
		// clipping it. Snap back to the top on page turns.
		// biome-ignore lint/correctness/useExhaustiveDependencies: safePage is the page-turn trigger
		useLayoutEffect(() => {
			viewRef.current?.scrollTo({ top: 0 })
		}, [safePage])

		// Report pagination state upward for the progress indicator (display only).
		useLayoutEffect(() => {
			onPaginationChange?.(safePage, pageCount)
		}, [safePage, pageCount, onPaginationChange])

		useImperativeHandle(
			ref,
			() => ({
				next: () => {
					userNavigated.current = true
					if (safePage < pageCount - 1) setPageIndex(safePage + 1)
					else onExitNext()
				},
				prev: () => {
					userNavigated.current = true
					if (safePage > 0) setPageIndex(safePage - 1)
					else onExitPrev()
				},
			}),
			[safePage, pageCount, onExitNext, onExitPrev],
		)

		const pageStart = breaks?.[safePage] ?? 0
		const pageEnd = breaks?.[safePage + 1] ?? rows.length

		return (
			<div ref={viewRef} className="relative h-full overflow-y-auto scrollbar-hide">
				{/* Visible page: a contiguous slice of the shared rows. */}
				<div className="pt-2">
					{style.contentLayout === 'stanzas' && (
						<LanguageColumnsHeader activeLangs={activeLangs} theme={style.theme} />
					)}
					{rows.slice(pageStart, pageEnd).map((row, i) => (
						<Row
							key={pageStart + i}
							row={row}
							activeLangs={activeLangs}
							isPageStart={i === 0}
							{...style}
						/>
					))}
				</div>
				{/* Hidden full-section measurer — identical width/fonts so heights match exactly.
				    Client-only: it exists purely to measure, so it never ships in the SSR HTML.
				    overflow-hidden: it is taller than the view; without it the scrollable view
				    gains phantom scroll range. */}
				{isClient && (
					<div
						ref={measureRef}
						aria-hidden
						className="absolute inset-0 pt-2 invisible pointer-events-none overflow-hidden"
					>
						{rows.map((row, i) => (
							<Row key={i} row={row} activeLangs={activeLangs} {...style} />
						))}
					</div>
				)}
			</div>
		)
	},
)
