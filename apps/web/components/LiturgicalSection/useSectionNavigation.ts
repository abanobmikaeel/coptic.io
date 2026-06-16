import type { IncenseSection } from '@/lib/types'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export interface SectionNavigation {
	/** Sections shown in the service flow (optional ones included only once added). */
	sections: IncenseSection[]
	/** Optional sections (Matins litanies, out-of-season nature litanies) offered as extras. */
	optionalSections: IncenseSection[]
	sectionIndex: number
	currentSection: IncenseSection | undefined
	currentSectionId: string | undefined
	lastIndex: number
	/** Ids of optional sections the user has added (persisted per service). */
	extras: string[]
	/** Which end of a section to land on when it mounts (drives PresentationView). */
	enterFrom: 'first' | 'last'
	jumpTo: (index: number) => void
	stepSection: (delta: number, enter?: 'first' | 'last') => void
	/** Adds or removes an optional section; returns which happened (caller may close the TOC). */
	toggleExtra: (id: string) => 'added' | 'removed'
}

// Owns the reader's section state: which section is current (tracked by id so it survives the
// visible list changing), the user's added optional prayers (localStorage), and last-viewed
// position (sessionStorage, to survive the remounts that language toggles cause).
export function useSectionNavigation(
	allSections: IncenseSection[],
	basePath: string,
): SectionNavigation {
	// Tracked by id, not index, so it survives the visible list changing (adding/removing
	// optional prayers, language switches); null means the first section.
	const [currentId, setCurrentId] = useState<string | null>(null)
	const [enterFrom, setEnterFrom] = useState<'first' | 'last'>('first')

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
	// Derive the index from the id; an unknown id (cleared storage, removed extra) lands first.
	const sectionIndex = useMemo(() => {
		if (!currentId) return 0
		const i = sections.findIndex((s) => s.id === currentId)
		return i >= 0 ? i : 0
	}, [currentId, sections])
	const currentSection = sections[Math.min(sectionIndex, lastIndex)]
	const currentSectionId = currentSection?.id

	const toggleExtra = useCallback(
		(id: string): 'added' | 'removed' => {
			const enabled = extras.includes(id)
			const next = enabled ? extras.filter((x) => x !== id) : [...extras, id]
			try {
				localStorage.setItem(extrasKey, JSON.stringify(next))
			} catch {
				/* best effort */
			}
			if (!enabled) {
				// Adding a prayer jumps straight to it.
				setCurrentId(id)
				setEnterFrom('first')
			} else if (currentSectionId === id) {
				// Removing the section being viewed lands on its neighbor.
				const idx = sections.findIndex((s) => s.id === id)
				setCurrentId((sections[idx - 1] ?? sections[idx + 1])?.id ?? null)
			}
			setExtras(next)
			return enabled ? 'removed' : 'added'
		},
		[extras, extrasKey, currentSectionId, sections],
	)

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

	const jumpTo = useCallback(
		(index: number) => {
			setCurrentId(sections[index]?.id ?? null)
			setEnterFrom('first')
		},
		[sections],
	)

	return {
		sections,
		optionalSections,
		sectionIndex,
		currentSection,
		currentSectionId,
		lastIndex,
		extras,
		enterFrom,
		jumpTo,
		stepSection,
		toggleExtra,
	}
}
