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
	GearIcon,
	NoticeBand,
	PresentationView,
	type PresentationViewHandle,
	RoleBadge,
	SectionDots,
	SectionListOverlay,
	ServiceSection,
	SideArrows,
	TocIcon,
	alignSection,
	useSectionNavigation,
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
	// Replaces the date navigation in the header — e.g. an hour switcher for the Agpeya,
	// which is hour-based rather than date-based.
	headerCenter?: React.ReactNode
	// Content languages this service can render; passed to the settings menu so languages
	// with no content (e.g. Spanish has no Agpeya prose) are hidden from the picker.
	availableLanguages?: BibleTranslation[]
	// Dense hymnody can opt into paired stanza surfaces while prose services
	// retain the established Agpeya/Vespers presentation.
	contentLayout?: 'prose' | 'stanzas'
	// Fixed row groups for hymn forms that should not be packed by viewport height.
	// Keys correspond to section `kind` values.
	rowsPerPageByKind?: Partial<Record<string, number>>
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
	headerCenter,
	availableLanguages,
	contentLayout = 'prose',
	rowsPerPageByKind,
}: LiturgicalServiceReaderProps) {
	const { settings, actions, mounted } = useReadingSettings()
	const {
		languages: contentLanguages,
		setLanguages: setContentLanguages,
		isLoaded: langsLoaded,
	} = useContentLanguages()
	const locale = useLocale()
	// Present vs. continuous "Reading" mode is persisted in the URL/preferences via
	// useReadingSettings, so it survives hour/date navigation (e.g. Agpeya).
	const mode = mounted ? settings.mode : 'present'
	const setMode = actions.setMode
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
	// Navigation must come from the most complete translation. A scripture-only
	// language such as Coptic may be displayed first, but must not hide prose
	// sections that are available in Arabic or English.
	const { lang: primaryLang, service: primaryService } = useMemo(() => {
		let best: { lang: BibleTranslation; service?: IncenseService } = {
			lang: langs[0] ?? 'en',
		}
		for (const lang of langs) {
			const service = servicesByLang[lang]
			if (service && service.sections.length > (best.service?.sections.length ?? -1)) {
				best = { lang, service }
			}
		}
		return best
	}, [langs, servicesByLang])
	const allSections = useMemo(() => primaryService?.sections ?? [], [primaryService])

	// Section state (which section, added optional prayers, last-viewed position) lives in the
	// hook; closing the TOC on jump/add is UI, so those two are thin wrappers here.
	const nav = useSectionNavigation(allSections, basePath)
	const {
		sections,
		optionalSections,
		sectionIndex,
		currentSection,
		currentSectionId,
		lastIndex,
		extras,
		enterFrom,
		stepSection,
	} = nav
	const jumpToSection = (i: number) => {
		nav.jumpTo(i)
		setTocOpen(false)
	}
	const toggleExtra = (id: string) => {
		if (nav.toggleExtra(id) === 'added') setTocOpen(false)
	}

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
		viewMode: settings.viewMode,
		showVerses: settings.showVerses,
		contentLayout,
	}

	// One aligned-rows structure per section drives BOTH reader modes (scroll and
	// presentation) — the single place languages are reconciled. See align.ts.
	const aligned = useMemo(
		() => (currentSectionId ? alignSection(servicesByLang, currentSectionId, langs) : null),
		[currentSectionId, langs, servicesByLang],
	)

	// Per-language scripture reference strings for the scroll-mode header row.
	const refsByLang = useMemo(() => {
		if (!currentSectionId) return undefined
		const scripture = new Set(['psalm', 'gospel', 'daily-psalm'])
		const out: Partial<Record<BibleTranslation, string>> = {}
		for (const lang of langs) {
			const section = servicesByLang[lang]?.sections.find((s) => s.id === currentSectionId)
			if (section?.reference && scripture.has(section.type)) out[lang] = section.reference
		}
		return out
	}, [currentSectionId, langs, servicesByLang])

	const isPaginated = mode === 'present' && aligned != null
	const rowsPerPage = currentSection?.kind ? rowsPerPageByKind?.[currentSection.kind] : undefined

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
			{contentLayout === 'stanzas' && currentSection.kind && (
				<span
					className={`rounded-full border border-current/15 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] ${themeClasses.accent[theme]}`}
				>
					{currentSection.kind}
				</span>
			)}
			<h2 className={`text-sm font-semibold ${themeClasses.textHeading[theme]}`}>
				{currentSection.title}
			</h2>
			{currentSection.titleLanguage && currentSection.titleLanguage !== primaryLang && (
				<span className={`text-[10px] ${themeClasses.muted[theme]}`}>
					{currentSection.titleLanguage.toUpperCase()} title
				</span>
			)}
			<RoleBadge role={currentSection.role} lang={primaryLang} theme={theme} />
			{currentSection.reference && (
				<span className={`text-xs font-mono ${themeClasses.accent[theme]}`}>
					{currentSection.reference}
				</span>
			)}
		</>
	)

	// Bottom section-dot navigation (shared by both modes; positioned by the wrapper).

	const header = (
		<ReadingsHeader theme={theme} layout="between">
			<div className="flex items-center gap-2 min-w-0">
				<Breadcrumb items={[{ label: title, href: basePath }]} theme={theme} />
				{headerCenter ?? (
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
				)}
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
							availableLanguages={availableLanguages}
							onContentLanguagesChange={setContentLanguages}
							onClose={() => setSettingsOpen(false)}
							extraSection={
								<>
									<SettingSection label="Reader Mode">
										<SegmentedButtons
											value={mode}
											onChange={setMode}
											options={[
												{ value: 'present', label: 'Present' },
												{ value: 'scroll', label: 'Scroll' },
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
			{notice && <NoticeBand notice={notice} theme={theme} />}
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
						className={`flex-none flex items-center gap-3 px-3 sm:px-14 md:px-16 py-2 border-b border-current/10 ${themeClasses.bg[theme]}`}
					>
						{titleBar}
						{isPaginated &&
							pagination.count > 1 &&
							// dir=ltr so page indicators always fill left-to-right (matching
							// next/ArrowRight advancing) and don't reverse under an RTL locale.
							// Long sections on narrow columns can paginate into dozens of pages;
							// past a dozen the dot strip no longer fits, so fall back to a counter.
							(pagination.count > 12 ? (
								<span
									dir="ltr"
									className={`ml-auto flex-none text-[11px] font-medium tabular-nums ${themeClasses.muted[theme]}`}
								>
									{pagination.index + 1} / {pagination.count}
								</span>
							) : (
								<div dir="ltr" className="flex items-center gap-1 ml-auto">
									{Array.from({ length: pagination.count }, (_, i) => (
										<span
											key={i}
											className={`block h-1 rounded-full transition-all duration-200 flex-shrink-0 ${i === pagination.index ? 'w-4 bg-amber-500' : 'w-1.5 bg-current opacity-15'}`}
										/>
									))}
								</div>
							))}
					</div>

					{currentSection.rubric && (
						<p
							className={`flex-none px-3 sm:px-14 md:px-16 pt-2 text-xs italic ${themeClasses.muted[theme]}`}
						>
							{currentSection.rubric}
						</p>
					)}

					{/* Content region — fills remaining height. Faded in once fully settled. */}
					<div
						className={`flex-1 min-h-0 transition-opacity duration-200 ${ready ? 'opacity-100' : 'opacity-0'}`}
					>
						{isPaginated && aligned ? (
							<div
								className={`h-full px-2 sm:px-14 md:px-16 ${contentLayout === 'stanzas' ? 'mx-auto w-full max-w-[1480px]' : ''}`}
							>
								<PresentationView
									key={currentSectionId}
									ref={presentRef}
									rows={aligned.rows}
									activeLangs={aligned.activeLangs}
									initialPage={enterFrom}
									onExitNext={onExitNext}
									onExitPrev={onExitPrev}
									onPaginationChange={onPaginationChange}
									rowsPerPage={rowsPerPage}
									{...styleProps}
								/>
							</div>
						) : (
							<div ref={scrollRef} className="h-full overflow-y-auto px-2 sm:px-14 md:px-16 py-4">
								{aligned && (
									<div
										className={contentLayout === 'stanzas' ? 'mx-auto w-full max-w-[1480px]' : ''}
									>
										<ServiceSection
											key={currentSectionId}
											rows={aligned.rows}
											activeLangs={aligned.activeLangs}
											refsByLang={refsByLang}
											{...styleProps}
										/>
									</div>
								)}
							</div>
						)}
					</div>

					{/* Bottom section dots. dir=ltr so dots + prev/next fill left-to-right
					    (matching next/ArrowRight and the top progress) under an RTL locale. */}
					<div
						dir="ltr"
						className={`flex-none flex items-center gap-4 px-4 py-3 border-t ${themeClasses.border[theme]} ${themeClasses.bg[theme]}`}
					>
						<SectionDots
							sections={sections}
							sectionIndex={sectionIndex}
							compact={contentLayout === 'stanzas'}
							theme={theme}
							hasPrev={hasPrev}
							hasNext={hasNext}
							onPrev={goPrev}
							onNext={goNext}
							onJump={jumpToSection}
						/>
					</div>
				</div>
			)}

			<SideArrows
				hasPrev={hasPrev}
				hasNext={hasNext}
				onPrev={goPrev}
				onNext={goNext}
				theme={theme}
			/>
			{tocOpen && (
				<SectionListOverlay
					sections={sections}
					optionalSections={optionalSections}
					activeIndex={sectionIndex}
					extras={extras}
					theme={theme}
					onJump={jumpToSection}
					onToggleExtra={toggleExtra}
					onClose={() => setTocOpen(false)}
				/>
			)}
		</ReadingPageLayout>
	)
}
