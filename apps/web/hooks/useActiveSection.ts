import { useEffect, useState } from 'react'

export function useActiveSection(ids: string[]): string | null {
	const [activeSection, setActiveSection] = useState<string | null>(null)

	useEffect(() => {
		if (ids.length === 0) return

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) setActiveSection(entry.target.id)
				}
			},
			{ rootMargin: '-30% 0px -60% 0px', threshold: 0 },
		)

		for (const id of ids) {
			const el = document.getElementById(id)
			if (el) observer.observe(el)
		}

		return () => observer.disconnect()
	}, [ids])

	return activeSection
}
