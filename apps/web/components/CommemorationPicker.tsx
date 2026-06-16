'use client'

import { SettingSection } from '@/components/settings'
import { API_BASE_URL } from '@/config'
import { INCENSE_COMMEMORATIONS_COOKIE, commemorationLabel } from '@/lib/commemorations'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface CommemorationPickerProps {
	// Currently-selected commemoration keys (from the cookie, resolved server-side).
	selected: string[]
}

// Lets the user pick their church's patron saint (or any commemorated saint) so its verses are
// added to the service. Options come from the API catalog, so the list grows as verses are added.
// Writes the selection to a cookie and refreshes so the server re-fetches the resolved service.
export function CommemorationPicker({ selected }: CommemorationPickerProps) {
	const router = useRouter()
	const [options, setOptions] = useState<string[]>([])

	useEffect(() => {
		let cancelled = false
		fetch(`${API_BASE_URL}/incense/commemorations`)
			.then((r) => (r.ok ? r.json() : { commemorations: [] }))
			.then((d) => {
				if (!cancelled) setOptions(d.commemorations ?? [])
			})
			.catch(() => {})
		return () => {
			cancelled = true
		}
	}, [])

	if (options.length === 0) return null

	const toggle = (key: string) => {
		const next = selected.includes(key) ? selected.filter((k) => k !== key) : [...selected, key]
		document.cookie = `${INCENSE_COMMEMORATIONS_COOKIE}=${next.join(',')}; path=/; max-age=31536000`
		router.refresh()
	}

	return (
		<SettingSection label="Saint of the Church">
			<div className="grid grid-cols-2 gap-2">
				{options.map((key) => {
					const isSelected = selected.includes(key)
					return (
						<button
							key={key}
							type="button"
							onClick={() => toggle(key)}
							aria-pressed={isSelected}
							className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
								isSelected
									? 'bg-amber-700 text-white'
									: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
							}`}
						>
							{commemorationLabel(key)}
						</button>
					)
				})}
			</div>
		</SettingSection>
	)
}
