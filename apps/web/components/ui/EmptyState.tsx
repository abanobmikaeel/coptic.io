'use client'

import { BookIcon, CalendarIcon, SearchIcon } from '@/components/ui/Icons'
import { useTranslations } from 'next-intl'
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
		<div
			className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}
		>
			<div className={`mb-4 ${styles.icon}`}>{icon || <DefaultIcon className="w-12 h-12" />}</div>
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
	const t = useTranslations('emptyStates')
	const tCommon = useTranslations('common')

	return (
		<EmptyState
			icon={<SearchIcon className="w-12 h-12" strokeWidth={1.5} />}
			title={t('noResults')}
			description={query ? t('noResultsWithQuery', { query }) : t('noResultsGeneric')}
			theme={theme}
			action={
				onClear && (
					<button
						type="button"
						onClick={onClear}
						className="text-sm text-amber-600 hover:text-amber-700 dark:text-amber-500 dark:hover:text-amber-400 font-medium"
					>
						{tCommon('clearSearch')}
					</button>
				)
			}
		/>
	)
}

export function NoReadingsState({ theme = 'light' }: { theme?: 'light' | 'sepia' | 'dark' }) {
	const t = useTranslations('emptyStates')

	return (
		<EmptyState
			icon={<BookIcon className="w-12 h-12" />}
			title={t('readingsUnavailable')}
			description={t('readingsUnavailableDescription')}
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
	const t = useTranslations('emptyStates')

	return (
		<EmptyState
			icon={<CalendarIcon className="w-12 h-12" />}
			title={t('noEntriesTitle', { type })}
			description={t('noEntriesDescription', { type })}
			theme={theme}
		/>
	)
}
