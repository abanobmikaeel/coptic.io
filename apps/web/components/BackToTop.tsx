'use client'

import { useEffect, useState } from 'react'

export function BackToTop() {
	const [show, setShow] = useState(false)

	useEffect(() => {
		const handleScroll = () => {
			setShow(window.scrollY > 400)
		}

		window.addEventListener('scroll', handleScroll, { passive: true })
		return () => window.removeEventListener('scroll', handleScroll)
	}, [])

	const scrollToTop = () => {
		window.scrollTo({ top: 0, behavior: 'smooth' })
	}

	if (!show) return null

	return (
		<button
			type="button"
			onClick={scrollToTop}
			className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-amber-600 hover:bg-amber-700 text-white shadow-lg transition-all hover:scale-105 active:scale-95"
			aria-label="Back to top"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
				aria-hidden="true"
			>
				<path d="m18 15-6-6-6 6" />
			</svg>
		</button>
	)
}
