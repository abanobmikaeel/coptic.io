'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

/**
 * Preserves the search → entry deep link. Synaxarium search results link to
 * /synaxarium/{date}?entry={name}; this scrolls that commemoration into view.
 * Content is server-rendered; this only adds the scroll behavior.
 */
export function ScrollToEntry() {
	const entry = useSearchParams().get('entry')

	useEffect(() => {
		if (!entry) return
		// useSearchParams() already returns a decoded value.
		const el = Array.from(document.querySelectorAll<HTMLElement>('[data-entry]')).find(
			(node) => node.dataset.entry === entry,
		)
		el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
	}, [entry])

	return null
}
