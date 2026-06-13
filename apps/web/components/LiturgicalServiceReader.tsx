'use client'

import { Breadcrumb } from '@/components/Breadcrumb'
import { DateNavigation } from '@/components/DateNavigation'
import type { ReadingTheme } from '@/components/DisplaySettings'
import type {
	FontFamily,
	FontWeight,
	LineSpacing,
	TextSize,
	WordSpacing,
} from '@/components/DisplaySettings'
import {
	type FlatLine,
	PresentationView,
	type PresentationViewHandle,
	RoleBadge,
	ServiceSection,
	alignByRubric,
	flattenToLines,
} from '@/components/LiturgicalSection'
import { ReadingPageLayout } from '@/components/ReadingPageLayout'
import { ReadingsHeader } from '@/components/ReadingsHeader'
import type { BibleTranslation } from '@/components/ScriptureReading/types'
import { SegmentedButtons, SettingSection, SettingsPanel } from '@/components/settings'
import { useContentLanguages } from '@/hooks/useContentLanguages'
import { useKeyboardNav } from '@/hooks/useKeyboardNav'
import { useReadingSettings } from '@/hooks/useReadingSettings'
import { useViewportFillHeight } from '@/hooks/useViewportFillHeight'
import { themeClasses } from '@/lib/reading-styles'
import type { IncenseService } from '@/lib/types'
import { parseDateString } from '@/lib/utils'
import { useLocale } from 'next-intl'
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'

// ── Icons ───────────────────────────────────────────────────────────────────

function GearIcon() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
		>
			<circle cx="12" cy="12" r="3" />
			<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
		</svg>
	)
}
function Chevron({ dir }: { dir: 'left' | 'right' }) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="18"
			height="18"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
		>
			<path d={dir === 'left' ? 'm15 18-6-6 6-6' : 'm9 18 6-6-6-6'} />
		</svg>
	)
}
function TocIcon() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
		>
			<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
		</svg>
	)
}
// ── Fallback skeleton ───────────────────────────────────────────────────────

export function ServiceReaderFallback() {
	const shimmer = themeClasses.shimmer.light
	return (
		<main className={`min-h-screen ${themeClasses.bg.light}`}>
			<div
				className={`sticky top-14 z-30 ${themeClasses.bgTranslucent.light} backdrop-blur-sm border-b ${themeClasses.border.light}`}
			>
				<div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
					<div className={`h-10 w-32 rounded-full ${shimmer}`} />
					<div className={`h-10 w-10 rounded-lg ${shimmer}`} />
				</div>
			</div>
			<div className="max-w-4xl mx-auto px-6 pt-4 pb-32">
				<div className={`h-4 w-40 rounded mb-4 ${shimmer}`} />
				<div className="space-y-3">
					{[1, 2, 3, 4, 5].map((i) => (
						<div
							key={i}
							className={`h-5 ${i === 2 ? 'w-10/12' : i === 3 ? 'w-8/12' : 'w-full'} rounded ${shimmer}`}
						/>
					))}
				</div>
			</div>
		</main>
	)
}

// ── Reader ──────────────────────────────────────────────────────────────────

export interface LiturgicalServiceReaderProps {
	servicesByLang: Partial<Record<string, IncenseService>>
	langs: BibleTranslation[]
	// Breadcrumb label and DateNavigation base path, e.g. "Vespers" + "/vespers".
	title: string
	basePath: string
	// Optional service-specific controls rendered in the settings modal (e.g. the Vespers
	// saint-of-the-church picker).
	settingsExtra?: React.ReactNode
	// One-line banner under the header, e.g. the unsupported-language fallback note.
	notice?: string
}

// Generic reader for any multi-language liturgical service (Vespers, Midnight Praises, …).
// Owns present/scroll modes, section + page navigation, keyboard/touch input, and chrome.
// All pagination is delegated to PresentationView; adding a new service is just a page that
// fetches data and renders this with a different title/basePath.
export function LiturgicalServiceReader({
	servicesByLang,
	langs,
	title,
	basePath,
	settingsExtra,
	notice,
}: LiturgicalServiceReaderProps) {
	const { settings, actions, mounted } = useReadingSettings()
	const {
		languages: contentLanguages,
		setLanguages: setContentLanguages,
		isLoaded: langsLoaded,
	} = useContentLanguages()
	const locale = useLocale()
	// The current section, tracked by id so it survives the visible list changing
	// (adding/removing optional prayers, language switches); null means the first section.
	const [currentId, setCurrentId] = useState<string | null>(null)
	// Which end of a section to land on when it mounts: 'first' (forward/jump) or 'last'
	// (paged backward into it from the next section — PowerPoint-style).
	const [enterFrom, setEnterFrom] = useState<'first' | 'last'>('first')
	const [mode, setMode] = useState<'present' | 'scroll'>('present')
	const [pagination, setPagination] = useState({ index: 0, count: 1 })
	const [tocOpen, setTocOpen] = useState(false)
	const [settingsOpen, setSettingsOpen] = useState(false)

	const presentRef = useRef<PresentationViewHandle>(null)
	const scrollRef = useRef<HTMLDivElement>(null)
	const touchStart = useRef({ x: 0, y: 0 })
	const [containerRef, containerHeight] = useViewportFillHeight<HTMLDivElement>()

	// Lock page scroll — the reader fills the viewport below the header and owns all scrolling
	// internally (present mode: none; scroll mode: inside the content region).
	useEffect(() => {
		const prev = document.documentElement.style.overflow
		document.documentElement.style.overflow = 'hidden'
		return () => {
			document.documentElement.style.overflow = prev
		}
	}, [])

	// Fade content in once settings are applied and web fonts are loaded — avoids the
	// post-mount theme/size correction and font-load re-pagination showing as a jitter.
	const [fontsReady, setFontsReady] = useState(false)
	useEffect(() => {
		let cancelled = false
		const done = () => {
			if (!cancelled) setFontsReady(true)
		}
		document.fonts?.ready ? document.fonts.ready.then(done).catch(done) : done()
		return () => {
			cancelled = true
		}
	}, [])
	const ready = mounted && fontsReady

	const theme = (mounted ? settings.theme : 'light') as ReadingTheme
	const primaryService = servicesByLang[langs[0]] ?? Object.values(servicesByLang)[0]
	const allSections = useMemo(() => primaryService?.sections ?? [], [primaryService])

	// Optional sections (Matins litanies, out-of-season nature litanies) are hidden from
	// the service flow unless the user adds them from the section list. The selection is
	// persisted per service so a parish that always adds them keeps them.
	const extrasKey = `${basePath}:extras`
	const [extras, setExtras] = useState<string[]>([])
	const [extrasLoaded, setExtrasLoaded] = useState(false)
	useEffect(() => {
		try {
			const saved = localStorage.getItem(extrasKey)
			if (saved) setExtras(JSON.parse(saved))
		} catch {
			/* corrupt or unavailable storage — start clean */
		}
		setExtrasLoaded(true)
	}, [extrasKey])
	const optionalSections = useMemo(() => allSections.filter((s) => s.optional), [allSections])
	const sections = useMemo(
		() => allSections.filter((s) => !s.optional || extras.includes(s.id)),
		[allSections, extras],
	)

	const lastIndex = sections.length - 1
	// Index is derived from the id; an unknown id (cleared storage, removed extra) lands
	// on the first section.
	const sectionIndex = useMemo(() => {
		if (!currentId) return 0
		const i = sections.findIndex((s) => s.id === currentId)
		return i >= 0 ? i : 0
	}, [currentId, sections])
	const currentSection = sections[Math.min(sectionIndex, lastIndex)]
	const currentSectionId = currentSection?.id

	const toggleExtra = (id: string) => {
		const enabled = extras.includes(id)
		const next = enabled ? extras.filter((x) => x !== id) : [...extras, id]
		try {
			localStorage.setItem(extrasKey, JSON.stringify(next))
		} catch {
			/* best effort */
		}
		if (!enabled) {
			// Adding a prayer jumps straight to it
			setCurrentId(id)
			setEnterFrom('first')
			setTocOpen(false)
		} else if (currentSectionId === id) {
			// Removing the section being viewed lands on its neighbor
			const idx = sections.findIndex((s) => s.id === id)
			setCurrentId((sections[idx - 1] ?? sections[idx + 1])?.id ?? null)
		}
		setExtras(next)
	}

	// Survive the remounts caused by settings changes (language toggles re-render the page
	// through the Suspense boundary): restore the last-viewed section once per mount.
	const positionKey = `${basePath}:section`
	const restored = useRef(false)
	useEffect(() => {
		if (restored.current || !extrasLoaded || sections.length === 0) return
		restored.current = true
		try {
			const savedId = sessionStorage.getItem(positionKey)
			if (savedId && sections.some((s) => s.id === savedId)) setCurrentId(savedId)
		} catch {
			/* unavailable storage */
		}
	}, [sections, positionKey, extrasLoaded])
	useEffect(() => {
		if (!restored.current || !currentSectionId) return
		try {
			sessionStorage.setItem(positionKey, currentSectionId)
		} catch {
			/* best effort */
		}
	}, [currentSectionId, positionKey])

	// "Sat, Jun 21 · Paona 14" — the Gregorian day this service belongs to plus its Coptic
	// date, rendered between the date-navigation chevrons.
	const dateLabel = useMemo(() => {
		if (!primaryService?.date) return null
		const gregorian = new Intl.DateTimeFormat(locale, {
			weekday: 'short',
			month: 'short',
			day: 'numeric',
		}).format(parseDateString(primaryService.date))
		const coptic = primaryService.copticDate
		return coptic ? `${gregorian} · ${coptic.monthString} ${coptic.day}` : gregorian
	}, [primaryService, locale])

	const styleProps = {
		theme,
		textSize: (settings.textSize as TextSize) || 'md',
		fontFamily: (settings.fontFamily as FontFamily) || 'sans',
		lineSpacing: (settings.lineSpacing as LineSpacing) || 'normal',
		wordSpacing: (settings.wordSpacing as WordSpacing) || 'normal',
		weight: (settings.weight as FontWeight) || 'normal',
	}

	// Flattened lines per language for the current section. Prayer/litany sections flatten
	// their `content`; scripture sections (psalm/gospel) flatten their resolved `verses` so
	// they paginate too — present mode never scrolls, regardless of section type.
	const flatByLang = useMemo(() => {
		if (!currentSectionId) return null
		const out: Record<string, FlatLine[]> = {}
		let total = 0
		for (const lang of langs) {
			const section = servicesByLang[lang]?.sections.find((s) => s.id === currentSectionId)
			out[lang] = section?.content?.length
				? flattenToLines(section.content)
				: (section?.verses ?? []).map((v) => ({
						text: v.text,
						num: v.num,
						isRubric: false,
						isNewSpeakerGroup: false,
					}))
			total += out[lang].length
		}
		if (total === 0) return null
		// Keep columns row-aligned where languages differ in rubric count (Coptic has none).
		return alignByRubric(out, langs)
	}, [currentSectionId, langs, servicesByLang])

	const isPaginated = mode === 'present' && flatByLang != null

	const stepSection = useCallback(
		(delta: number, enter: 'first' | 'last' = 'first') => {
			setCurrentId((prev) => {
				const i = prev ? sections.findIndex((s) => s.id === prev) : 0
				const next = Math.max(0, Math.min(Math.max(i, 0) + delta, sections.length - 1))
				return sections[next]?.id ?? prev
			})
			setEnterFrom(enter)
		},
		[sections],
	)
	const onExitNext = useCallback(() => stepSection(1, 'first'), [stepSection])
	// Paging backward out of a section lands on the previous section's last page (PowerPoint-style).
	const onExitPrev = useCallback(() => stepSection(-1, 'last'), [stepSection])
	const onPaginationChange = useCallback(
		(index: number, count: number) => setPagination({ index, count }),
		[],
	)

	const goNext = () => (isPaginated ? presentRef.current?.next() : stepSection(1))
	const goPrev = () => {
		if (isPaginated) return presentRef.current?.prev()
		// Scroll mode: snap to top before leaving the section if scrolled down.
		if (scrollRef.current && scrollRef.current.scrollTop > 0) {
			scrollRef.current.scrollTo({ top: 0 })
			return
		}
		stepSection(-1)
	}

	const onTouchEnd = (e: React.TouchEvent) => {
		const dx = touchStart.current.x - e.changedTouches[0].clientX
		const dy = touchStart.current.y - e.changedTouches[0].clientY
		if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) (dx > 0 ? goNext : goPrev)()
	}

	const hasPrev = sectionIndex > 0 || (isPaginated && pagination.index > 0)
	const hasNext =
		sectionIndex < lastIndex || (isPaginated && pagination.index < pagination.count - 1)

	const jumpToSection = (i: number) => {
		setCurrentId(sections[i]?.id ?? null)
		setEnterFrom('first')
		setTocOpen(false)
	}

	// Arrow nav is suspended while the section list is open; Escape closes it.
	useKeyboardNav({
		onNext: tocOpen ? undefined : goNext,
		onPrev: tocOpen ? undefined : goPrev,
		onNextSection: tocOpen ? undefined : () => stepSection(1),
		onPrevSection: tocOpen ? undefined : () => stepSection(-1),
		onExit: tocOpen ? () => setTocOpen(false) : undefined,
	})

	// `t` toggles the section list (table of contents), ignoring keypresses while typing.
	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.key !== 't' && e.key !== 'T') return
			const el = e.target as HTMLElement | null
			if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable))
				return
			e.preventDefault()
			setTocOpen((o) => !o)
		}
		window.addEventListener('keydown', onKey)
		return () => window.removeEventListener('keydown', onKey)
	}, [])

	const titleBar = currentSection && (
		<>
			<h2 className={`text-sm font-semibold ${themeClasses.textHeading[theme]}`}>
				{currentSection.title}
			</h2>
			<RoleBadge role={currentSection.role} lang={langs[0] ?? 'en'} theme={theme} />
			{currentSection.reference && (
				<span className={`text-xs font-mono ${themeClasses.accent[theme]}`}>
					{currentSection.reference}
				</span>
			)}
		</>
	)

	// Bottom section-dot navigation (shared by both modes; positioned by the wrapper).
	const sectionNav = (
		<>
			<button
				type="button"
				onClick={goPrev}
				disabled={!hasPrev}
				className={`flex-shrink-0 p-1.5 rounded-lg transition-colors disabled:opacity-25 ${themeClasses.muted[theme]} hover:text-amber-600 dark:hover:text-amber-500`}
				aria-label="Previous"
			>
				<Chevron dir="left" />
			</button>
			<div className="flex-1 flex items-center justify-center gap-1.5 overflow-x-auto">
				{sections.map((s, i) => (
					<div key={s.id} className="group relative flex-shrink-0">
						<button
							type="button"
							onClick={() => jumpToSection(i)}
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
				onClick={goNext}
				disabled={!hasNext}
				className={`flex-shrink-0 p-1.5 rounded-lg transition-colors disabled:opacity-25 ${themeClasses.muted[theme]} hover:text-amber-600 dark:hover:text-amber-500`}
				aria-label="Next"
			>
				<Chevron dir="right" />
			</button>
		</>
	)

	const sideArrows = (
		<>
			{hasPrev && (
				<button
					type="button"
					onClick={goPrev}
					className={`fixed left-2 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full ${themeClasses.bgTranslucent[theme]} backdrop-blur-sm border ${themeClasses.border[theme]} shadow-sm transition-colors ${themeClasses.muted[theme]} hover:text-amber-600 dark:hover:text-amber-500`}
					aria-label="Previous"
				>
					<Chevron dir="left" />
				</button>
			)}
			{hasNext && (
				<button
					type="button"
					onClick={goNext}
					className={`fixed right-2 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full ${themeClasses.bgTranslucent[theme]} backdrop-blur-sm border ${themeClasses.border[theme]} shadow-sm transition-colors ${themeClasses.muted[theme]} hover:text-amber-600 dark:hover:text-amber-500`}
					aria-label="Next"
				>
					<Chevron dir="right" />
				</button>
			)}
		</>
	)

	// Table-of-contents overlay — jump to any section. Opened via the header list icon or `t`.
	const tocOverlay = tocOpen && (
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
				onClick={() => setTocOpen(false)}
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
						onClick={() => setTocOpen(false)}
						className={`p-1 rounded ${themeClasses.muted[theme]} hover:text-amber-600 dark:hover:text-amber-500`}
						aria-label="Close"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							aria-hidden="true"
						>
							<path d="M18 6 6 18M6 6l12 12" />
						</svg>
					</button>
				</div>
				<ul className="py-1">
					{sections.map((s, i) => (
						<li key={s.id}>
							<button
								type="button"
								onClick={() => jumpToSection(i)}
								className={`w-full text-left px-4 py-2.5 flex items-center gap-3 transition-colors ${
									i === sectionIndex
										? `bg-amber-500/10 ${themeClasses.textHeading[theme]}`
										: `${themeClasses.text[theme]} hover:bg-current/5`
								}`}
							>
								<span
									className={`text-xs font-mono tabular-nums w-5 flex-shrink-0 ${i === sectionIndex ? 'text-amber-500' : themeClasses.muted[theme]}`}
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
								{i === sectionIndex && (
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
											onClick={() => toggleExtra(s.id)}
											aria-pressed={enabled}
											className={`w-full text-left px-4 py-2.5 flex items-center gap-3 transition-colors ${themeClasses.text[theme]} hover:bg-current/5`}
										>
											<span
												className={`w-5 flex-shrink-0 flex items-center justify-center ${enabled ? 'text-amber-500' : themeClasses.muted[theme]}`}
											>
												{enabled ? (
													<svg
														xmlns="http://www.w3.org/2000/svg"
														width="14"
														height="14"
														viewBox="0 0 24 24"
														fill="none"
														stroke="currentColor"
														strokeWidth="2.5"
														strokeLinecap="round"
														strokeLinejoin="round"
														aria-hidden="true"
													>
														<path d="M20 6 9 17l-5-5" />
													</svg>
												) : (
													<svg
														xmlns="http://www.w3.org/2000/svg"
														width="14"
														height="14"
														viewBox="0 0 24 24"
														fill="none"
														stroke="currentColor"
														strokeWidth="2"
														strokeLinecap="round"
														strokeLinejoin="round"
														aria-hidden="true"
													>
														<path d="M12 5v14M5 12h14" />
													</svg>
												)}
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

	const header = (
		<ReadingsHeader theme={theme} layout="between">
			<div className="flex items-center gap-2 min-w-0">
				<Breadcrumb items={[{ label: title, href: basePath }]} theme={theme} />
				<Suspense fallback={null}>
					<DateNavigation theme={theme} basePath={basePath} keepDateParam>
						{dateLabel && (
							<span
								className={`text-xs sm:text-sm whitespace-nowrap tabular-nums ${themeClasses.muted[theme]}`}
							>
								{dateLabel}
							</span>
						)}
					</DateNavigation>
				</Suspense>
			</div>
			<div className="flex items-center gap-2 flex-shrink-0">
				<button
					type="button"
					onClick={() => setTocOpen(true)}
					title="Sections (T)"
					className={`p-1.5 rounded-md transition-colors ${themeClasses.muted[theme]} hover:text-amber-600 dark:hover:text-amber-500`}
				>
					<TocIcon />
				</button>
				<div className="relative">
					<button
						type="button"
						onClick={() => setSettingsOpen((o) => !o)}
						title="Settings"
						aria-label="Settings"
						className={`p-1.5 rounded-md transition-colors hover:text-amber-600 dark:hover:text-amber-500 ${settingsOpen ? 'text-amber-600 dark:text-amber-500' : themeClasses.muted[theme]}`}
					>
						<GearIcon />
					</button>
					{settingsOpen && langsLoaded && (
						<SettingsPanel
							settings={settings}
							actions={actions}
							contentLanguages={contentLanguages}
							onContentLanguagesChange={setContentLanguages}
							onClose={() => setSettingsOpen(false)}
							extraSection={
								<>
									<SettingSection label="Mode">
										<SegmentedButtons
											value={mode}
											onChange={setMode}
											options={[
												{ value: 'present', label: 'Present' },
												{ value: 'scroll', label: 'Reading' },
											]}
										/>
									</SettingSection>
									{settingsExtra}
								</>
							}
						/>
					)}
				</div>
			</div>
		</ReadingsHeader>
	)

	return (
		<ReadingPageLayout theme={theme} header={header}>
			{notice && (
				// Decorative Coptic textile band instead of a text banner; the message itself
				// lives in the tooltip and accessible label.
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
			)}
			{!primaryService || !currentSection ? (
				<div className="flex items-center justify-center py-32">
					<p className={themeClasses.muted[theme]}>Unable to load {title} service.</p>
				</div>
			) : (
				<div
					ref={containerRef}
					className="flex flex-col"
					style={{ height: containerHeight ?? 'calc(100dvh - 116px)' }}
					onTouchStart={(e) => {
						touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
					}}
					onTouchEnd={onTouchEnd}
				>
					{/* Section title + progress */}
					<div
						className={`flex-none flex items-center gap-3 px-14 sm:px-16 py-2 border-b border-current/10 ${themeClasses.bg[theme]}`}
					>
						{titleBar}
						{isPaginated && pagination.count > 1 && (
							<div className="flex items-center gap-1 ml-auto">
								{Array.from({ length: pagination.count }, (_, i) => (
									<span
										key={i}
										className={`block h-1 rounded-full transition-all duration-200 flex-shrink-0 ${i === pagination.index ? 'w-4 bg-amber-500' : 'w-1.5 bg-current opacity-15'}`}
									/>
								))}
							</div>
						)}
					</div>

					{currentSection.rubric && (
						<p
							className={`flex-none px-14 sm:px-16 pt-2 text-xs italic ${themeClasses.muted[theme]}`}
						>
							{currentSection.rubric}
						</p>
					)}

					{/* Content region — fills remaining height. Faded in once fully settled. */}
					<div
						className={`flex-1 min-h-0 transition-opacity duration-200 ${ready ? 'opacity-100' : 'opacity-0'}`}
					>
						{isPaginated && flatByLang ? (
							<div className="h-full px-14 sm:px-16">
								<PresentationView
									key={currentSectionId}
									ref={presentRef}
									flatByLang={flatByLang}
									langs={langs}
									initialPage={enterFrom}
									onExitNext={onExitNext}
									onExitPrev={onExitPrev}
									onPaginationChange={onPaginationChange}
									{...styleProps}
								/>
							</div>
						) : (
							<div ref={scrollRef} className="h-full overflow-y-auto px-14 sm:px-16 py-4">
								{currentSectionId && (
									<ServiceSection
										key={currentSectionId}
										sectionId={currentSectionId}
										servicesByLang={servicesByLang}
										langs={langs}
										{...styleProps}
									/>
								)}
							</div>
						)}
					</div>

					{/* Bottom section dots */}
					<div
						className={`flex-none flex items-center gap-4 px-4 py-3 border-t ${themeClasses.border[theme]} ${themeClasses.bg[theme]}`}
					>
						{sectionNav}
					</div>
				</div>
			)}

			{sideArrows}
			{tocOverlay}
		</ReadingPageLayout>
	)
}
