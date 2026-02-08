import { themeClasses } from '@/lib/reading-styles'
import type { ReadingTheme } from '../DisplaySettings'

interface ChevronIconProps {
	isOpen: boolean
	theme: ReadingTheme
	rotate?: 'left' | 'right'
}

export function ChevronIcon({ isOpen, theme, rotate }: ChevronIconProps) {
	const rotationClass = isOpen
		? ''
		: rotate === 'right'
			? 'rotate-90'
			: '-rotate-90'

	return (
		<svg
			width="20"
			height="20"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			className={`${themeClasses.muted[theme]} transition-transform flex-shrink-0 ${rotationClass}`}
			aria-hidden="true"
		>
			<path d="m6 9 6 6 6-6" />
		</svg>
	)
}
