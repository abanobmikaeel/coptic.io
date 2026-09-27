import { useLayoutEffect, useRef, useState } from 'react'

// Measures an element's distance from the top of the document and returns the height
// that makes it fill exactly to the viewport bottom — no magic-number offsets for the
// navbar/header stack, and correct across breakpoints. Re-measures on resize and when
// the layout above the reader changes.
//
// Uses document-relative top (rect.top + scrollY): the reader locks page scroll via
// react-remove-scroll, but the lock does NOT reset the existing scroll offset, so
// `rect.top` alone is relative to the *scrolled* viewport. Adding `scrollY` gives the
// true document position, so the element is sized to fill to the viewport bottom without
// over-sizing (which would clip the sticky chrome).
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

		// Re-measure on window resize and whenever the page layout above the reader
		// changes (header wrap, notice band toggling, banner height). Observing the
		// root element catches these position shifts without coupling to specific DOM.
		const onResize = () => measure()
		window.addEventListener('resize', onResize)
		window.addEventListener('orientationchange', onResize)

		let ro: ResizeObserver | undefined
		if (typeof ResizeObserver !== 'undefined') {
			ro = new ResizeObserver(onResize)
			ro.observe(document.documentElement)
		}

		return () => {
			window.removeEventListener('resize', onResize)
			window.removeEventListener('orientationchange', onResize)
			ro?.disconnect()
		}
	}, [])

	return [ref, height] as const
}
