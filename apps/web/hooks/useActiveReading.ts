'use client'

import type { ReadingItem } from '@/lib/reading-sections'
import { useEffect, useState } from 'react'

/** The last reading whose top has passed the upper third of the viewport. */
export function findActiveReading(readings: ReadingItem[]): string | null {
	const threshold = window.scrollY + window.innerHeight / 3
	let current: string | null = null
	for (const r of readings) {
		const rect = document.getElementById(`reading-${r.key}`)?.getBoundingClientRect()
		// Streamed sections still in their hidden placeholder measure 0×0 at the top
		if (rect?.height && rect.top + window.scrollY <= threshold) current = r.key
	}
	return current
}

/** Scrolls a reading's header to just below the sticky page headers. */
export function scrollToReading(key: string) {
	const element = document.getElementById(`reading-${key}`)
	if (!element) return
	const headerBottom = document
		.querySelector('[data-sticky-header]')
		?.getBoundingClientRect().bottom
	const offset = (headerBottom ?? 100) + 8
	const top = element.getBoundingClientRect().top + window.scrollY - offset
	window.scrollTo({ top, behavior: 'smooth' })
}

/** Tracks which reading is in view as the page scrolls or its layout shifts. */
export function useActiveReading(readings: ReadingItem[]): string | null {
	const [active, setActive] = useState<string | null>(null)

	useEffect(() => {
		const update = () => setActive(findActiveReading(readings))
		// Sections move without a scroll event when streamed content lands or one is collapsed
		const resizeObserver = new ResizeObserver(update)
		resizeObserver.observe(document.body)
		window.addEventListener('scroll', update, { passive: true })
		update()

		return () => {
			resizeObserver.disconnect()
			window.removeEventListener('scroll', update)
		}
	}, [readings])

	return active
}
