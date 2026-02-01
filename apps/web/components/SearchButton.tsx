'use client'

import { useCommandPaletteContext } from './CommandPalette'

export function SearchButton() {
	const { open } = useCommandPaletteContext()

	return (
		<button
			type="button"
			onClick={open}
			className="flex items-center gap-2 px-2.5 py-1.5 text-[13px] text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
			aria-label="Search (Cmd+K)"
		>
			<svg
				className="w-4 h-4"
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
			<span className="hidden sm:inline">Search</span>
			<kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-600">
				<span className="text-xs">⌘</span>K
			</kbd>
		</button>
	)
}
