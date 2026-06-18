'use client'

import { useCommandPaletteContext } from './CommandPalette'

export function SearchButton() {
	const { open } = useCommandPaletteContext()

	return (
		<button
			type="button"
			onClick={open}
			className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-colors"
			aria-label="Search (Cmd+K)"
			title="Search  ⌘K"
		>
			<svg
				className="w-[18px] h-[18px]"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
				aria-hidden="true"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={2}
					d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
				/>
			</svg>
		</button>
	)
}
