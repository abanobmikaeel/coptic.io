import type { ReactNode } from 'react'

interface EmptyStateProps {
	icon?: ReactNode
	title: string
	description?: string
	action?: ReactNode
	theme?: 'light' | 'sepia' | 'dark'
	className?: string
}

const themeStyles = {
	light: {
		icon: 'text-gray-300',
		title: 'text-gray-900',
		description: 'text-gray-500',
	},
	sepia: {
		icon: 'text-[#c4b39a]',
		title: 'text-[#5c4b32]',
		description: 'text-[#8b7355]',
	},
	dark: {
		icon: 'text-gray-600',
		title: 'text-white',
		description: 'text-gray-400',
	},
}

function DefaultIcon({ className }: { className?: string }) {
	return (
		<svg
			className={className}
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
			aria-hidden="true"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={1.5}
				d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
			/>
		</svg>
	)
}

function SearchIcon({ className }: { className?: string }) {
	return (
		<svg
			className={className}
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
			aria-hidden="true"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={1.5}
				d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
			/>
		</svg>
	)
}

function BookIcon({ className }: { className?: string }) {
	return (
		<svg
			className={className}
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
			aria-hidden="true"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={1.5}
				d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
			/>
		</svg>
	)
}

function CalendarIcon({ className }: { className?: string }) {
	return (
		<svg
			className={className}
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
			aria-hidden="true"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={1.5}
				d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
			/>
		</svg>
	)
}

export function EmptyState({
	icon,
	title,
	description,
	action,
	theme = 'light',
	className = '',
}: EmptyStateProps) {
	const styles = themeStyles[theme]

	return (
		<div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
			<div className={`mb-4 ${styles.icon}`}>
				{icon || <DefaultIcon className="w-12 h-12" />}
			</div>
			<h3 className={`text-lg font-medium mb-2 ${styles.title}`}>{title}</h3>
			{description && <p className={`text-sm max-w-md ${styles.description}`}>{description}</p>}
			{action && <div className="mt-6">{action}</div>}
		</div>
	)
}

// Pre-configured empty states for common use cases
export function NoResultsState({
	query,
	theme = 'light',
	onClear,
}: {
	query?: string
	theme?: 'light' | 'sepia' | 'dark'
	onClear?: () => void
}) {
	return (
		<EmptyState
			icon={<SearchIcon className="w-12 h-12" />}
			title="No results found"
			description={query ? `No matches for "${query}". Try different keywords or check your spelling.` : 'Try adjusting your search or filters.'}
			theme={theme}
			action={
				onClear && (
					<button
						type="button"
						onClick={onClear}
						className="text-sm text-amber-600 hover:text-amber-700 dark:text-amber-500 dark:hover:text-amber-400 font-medium"
					>
						Clear search
					</button>
				)
			}
		/>
	)
}

export function NoReadingsState({ theme = 'light' }: { theme?: 'light' | 'sepia' | 'dark' }) {
	return (
		<EmptyState
			icon={<BookIcon className="w-12 h-12" />}
			title="Readings unavailable"
			description="Unable to load readings for this date. Please try again later or select a different date."
			theme={theme}
		/>
	)
}

export function NoEntriesState({
	type = 'entries',
	theme = 'light',
}: {
	type?: string
	theme?: 'light' | 'sepia' | 'dark'
}) {
	return (
		<EmptyState
			icon={<CalendarIcon className="w-12 h-12" />}
			title={`No ${type} found`}
			description={`There are no ${type} for this date.`}
			theme={theme}
		/>
	)
}
