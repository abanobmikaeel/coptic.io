// Line spacing icons
export const LineSpacingCompactIcon = () => (
	<svg className="w-5 h-5 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
		<path d="M4 6h16M4 10h16M4 14h16M4 18h16" />
	</svg>
)

export const LineSpacingNormalIcon = () => (
	<svg className="w-5 h-5 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
		<path d="M4 5h16M4 10h16M4 15h16M4 20h16" />
	</svg>
)

export const LineSpacingRelaxedIcon = () => (
	<svg className="w-5 h-5 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
		<path d="M4 4h16M4 10h16M4 16h16M4 22h16" />
	</svg>
)

// Width icons
export const WidthIcon = ({ width }: { width: number }) => (
	<div className="flex justify-center">
		<div className="h-5 border-2 border-current rounded-sm" style={{ width }} />
	</div>
)

// Chevron icon
export const ChevronIcon = ({ isOpen }: { isOpen: boolean }) => (
	<svg
		width="12"
		height="12"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2.5"
		className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
		aria-hidden="true"
	>
		<path d="m6 9 6 6 6-6" />
	</svg>
)
