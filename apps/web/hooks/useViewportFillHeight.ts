import { useLayoutEffect, useRef, useState } from 'react'

// Measures an element's distance from the top of the document and returns the height
// that makes it fill exactly to the viewport bottom — no magic-number offsets for the
// navbar/header stack, and correct across breakpoints. Re-measures on resize.
// Uses document-relative top (rect.top + scrollY) so the result is scroll-independent:
// measuring while the page is scrolled won't over-size the element and clip the sticky chrome.
export function useViewportFillHeight<T extends HTMLElement = HTMLDivElement>() {
	const ref = useRef<T>(null)
	const [height, setHeight] = useState<number>()

	useLayoutEffect(() => {
		const measure = () => {
			if (!ref.current) return
			const top = ref.current.getBoundingClientRect().top + window.scrollY
			setHeight(window.innerHeight - top)
		}
		measure()
		window.addEventListener('resize', measure)
		return () => window.removeEventListener('resize', measure)
	}, [])

	return [ref, height] as const
}
