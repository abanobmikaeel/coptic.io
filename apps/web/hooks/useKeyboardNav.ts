import { useEffect, useRef } from 'react'

export interface KeyboardNavHandlers {
	onNext?: () => void
	onPrev?: () => void
	onNextSection?: () => void
	onPrevSection?: () => void
	onExit?: () => void
}

// Arrow-key navigation for clicker/keyboard-driven liturgical reading views.
// Right/Left page within a section; Down/Up jump between sections.
// Binds the listener once but always calls the latest handlers via a ref, so passing
// inline closures from the caller never re-subscribes or goes stale. Generic — usable
// by Vespers, Agpeya, or any future service view.
export function useKeyboardNav(handlers: KeyboardNavHandlers) {
	const latest = useRef(handlers)
	latest.current = handlers

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			const h = latest.current
			const action =
				e.key === 'ArrowRight'
					? h.onNext
					: e.key === 'ArrowLeft'
						? h.onPrev
						: e.key === 'ArrowDown'
							? h.onNextSection
							: e.key === 'ArrowUp'
								? h.onPrevSection
								: e.key === 'Escape'
									? h.onExit
									: undefined
			if (!action) return
			e.preventDefault() // these views own scrolling; arrows must not scroll the page
			action()
		}
		window.addEventListener('keydown', onKey)
		return () => window.removeEventListener('keydown', onKey)
	}, [])
}
