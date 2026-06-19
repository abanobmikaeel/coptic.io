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
import { PageCell } from './PageCell'
import { GRID_COLS } from './ServiceSection'
import { computePageBreaks, mapSharedPage } from './pagination'
import type { FlatLine } from './turns'

export interface PresentationViewHandle {
	next: () => void
	prev: () => void
}

interface PresentationViewProps {
	flatByLang: Record<string, FlatLine[]>
	langs: BibleTranslation[]
	theme: ReadingTheme
	textSize: TextSize
	fontFamily: FontFamily
	lineSpacing: LineSpacing
	wordSpacing: WordSpacing
	weight: FontWeight
	viewMode?: ViewMode
	showVerses?: boolean
	// Called when paging past the last/first page — parent advances to the adjacent section.
	onExitNext: () => void
	onExitPrev: () => void
	onPaginationChange?: (pageIndex: number, pageCount: number) => void
	// 'last' lands on the final page once measured — for PowerPoint-style backward entry
	// (paging left out of a section into the end of the previous one).
	initialPage?: 'first' | 'last'
}

// Reserve from the measured viewport: pt-2 (8px) above + a little breathing room below.
const PAGE_VERTICAL_RESERVE = 20

// Fully owns presentation-mode pagination for one section: measures the real rendered
// line heights, bins lines into screen-sized pages, and exposes next()/prev(). No scrolling.
// Remount per section (via `key`) to reset to the first page.
export const PresentationView = forwardRef<PresentationViewHandle, PresentationViewProps>(
	function PresentationView(
		{
			flatByLang,
			langs,
			onExitNext,
			onExitPrev,
			onPaginationChange,
			initialPage = 'first',
			...style
		},
		ref,
	) {
		const viewRef = useRef<HTMLDivElement>(null)
		const measureRef = useRef<HTMLDivElement>(null)
		const [breaksByLang, setBreaksByLang] = useState<Record<string, number[]>>({})
		const [pageIndex, setPageIndex] = useState(0)
		// The measurer is a client-only device — never ship its duplicate in the SSR payload.
		const [isClient, setIsClient] = useState(false)
		useEffect(() => setIsClient(true), [])

		const gridClass = GRID_COLS[langs.length] ?? ''
		const maxLines = Math.max(0, ...langs.map((l) => flatByLang[l]?.length ?? 0))
		const styleSig = `${style.textSize}|${style.lineSpacing}|${style.fontFamily}|${style.weight}|${style.wordSpacing}|${style.viewMode}|${style.showVerses}`

		// Measure rendered heights → compute page breaks. Runs before paint (no flicker).
		// styleSig/langs/isClient aren't used inside `measure` but are intentional re-measure
		// triggers: settings and the client-only measurer mount change the DOM heights we read.
		// biome-ignore lint/correctness/useExhaustiveDependencies: intentional re-measure triggers
		useLayoutEffect(() => {
			const measure = () => {
				const view = viewRef.current
				const grid = measureRef.current?.firstElementChild
				if (!view || !grid) return

				const cols = Array.from(grid.children) as HTMLElement[]
				// A continuous page starts on a fresh line, while the full-text measurer may
				// cross the same verse boundary midway through a line. Reserve one line so
				// that reflow cannot push the visible page behind the footer.
				const continuousLineReserve =
					style.viewMode === 'continuous'
						? Math.max(
								0,
								...cols.map((col) => {
									const marker = col.querySelector<HTMLElement>('[data-page-line]')
									return marker ? Number.parseFloat(getComputedStyle(marker).lineHeight) || 0 : 0
								}),
							)
						: 0
				const available = view.clientHeight - PAGE_VERTICAL_RESERVE - continuousLineReserve
				const heightsByLang = cols.map((col) => {
					const inlineRows = Array.from(
						col.querySelectorAll<HTMLElement>('[data-page-line]'),
					)
					if (inlineRows.length > 0) {
						let previousBottom = col.getBoundingClientRect().top
						return inlineRows.map((row) => {
							const bottom = row.getBoundingClientRect().bottom
							const height = Math.max(0, bottom - previousBottom)
							previousBottom = Math.max(previousBottom, bottom)
							return height
						})
					}

					const blockRows = Array.from(col.children) as HTMLElement[]
					return blockRows.map((row, i) => {
						const top = row.getBoundingClientRect().top
						const nextTop = blockRows[i + 1]?.getBoundingClientRect().top
						return nextTop != null ? nextTop - top : row.getBoundingClientRect().height
					})
				})
				const nextBreaks: Record<string, number[]> = {}
				langs.forEach((lang, index) => {
					const lines = flatByLang[lang] ?? []
					const isRubric = lines.map((line) => line.isRubric)
					nextBreaks[lang] = computePageBreaks(
						[heightsByLang[index] ?? []],
						available,
						lines.length,
						isRubric,
					)
				})
				setBreaksByLang(nextBreaks)
			}

			measure()
			const ro = new ResizeObserver(measure)
			if (viewRef.current) ro.observe(viewRef.current)
			document.fonts?.ready.then(measure).catch(() => {})
			return () => ro.disconnect()
		}, [maxLines, styleSig, langs, isClient])

		const pageCount = Math.max(
			1,
			...langs.map((lang) => Math.max(1, (breaksByLang[lang]?.length ?? 1) - 1)),
		)

		// PowerPoint-style backward entry: pin to the last page. Re-applies on every re-measure
		// (e.g. fonts loading can change the page count) until the user actually navigates.
		const userNavigated = useRef(false)
		useLayoutEffect(() => {
			if (initialPage === 'last' && !userNavigated.current && Object.keys(breaksByLang).length > 0) {
				setPageIndex(pageCount - 1)
			}
		}, [initialPage, pageCount, breaksByLang])

		const safePage = Math.min(pageIndex, pageCount - 1)

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

		return (
			<div ref={viewRef} className="relative h-full overflow-hidden">
				{/* Visible page */}
				<div className={`grid gap-x-6 pt-2 ${gridClass}`}>
					{langs.map((lang) => {
						const breaks = breaksByLang[lang] ?? [0, flatByLang[lang]?.length ?? 0]
						const languageCount = Math.max(1, breaks.length - 1)
						const languagePage = mapSharedPage(safePage, pageCount, languageCount)
						const pageStart = breaks[languagePage] ?? 0
						const pageEnd = breaks[languagePage + 1] ?? flatByLang[lang]?.length ?? 0
						return (
							<PageCell
								key={lang}
								lines={(flatByLang[lang] ?? []).slice(pageStart, pageEnd)}
								lang={lang}
								{...style}
							/>
						)
					})}
				</div>
				{/* Hidden full-section measurer — identical width/fonts so heights match exactly.
			    Client-only: it exists purely to measure, so it never ships in the SSR HTML. */}
				{isClient && (
					<div
						ref={measureRef}
						aria-hidden
						className="absolute inset-0 pt-2 invisible pointer-events-none"
					>
						<div className={`grid gap-x-6 ${gridClass}`}>
							{langs.map((lang) => (
								<PageCell key={lang} lines={flatByLang[lang] ?? []} lang={lang} {...style} />
							))}
						</div>
					</div>
				)}
			</div>
		)
	},
)
