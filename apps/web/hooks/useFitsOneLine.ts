'use client'

import { type RefObject, useLayoutEffect, useState } from 'react'

/**
 * Whether a row of items would fit on one line inside `container`, whichever layout they are in
 * now. Items are the elements marked `data-fit-item` (their widths don't change between a row and
 * a stack); `extra` is the width the row adds around them (separators, gaps) and `reserve` the
 * container width that other content keeps. Re-measures when the container resizes.
 */
export function useFitsOneLine(
	container: RefObject<HTMLElement | null>,
	{ extra, reserve }: { extra: number; reserve: number },
): boolean {
	const [fits, setFits] = useState(true)

	useLayoutEffect(() => {
		const el = container.current
		if (!el) return
		const measure = () => {
			const items = el.querySelectorAll<HTMLElement>('[data-fit-item]')
			const needed = [...items].reduce((sum, item) => sum + item.offsetWidth, extra)
			setFits(needed <= el.clientWidth - reserve)
		}
		const observer = new ResizeObserver(measure)
		observer.observe(el)
		measure()
		return () => observer.disconnect()
	}, [container, extra, reserve])

	return fits
}
