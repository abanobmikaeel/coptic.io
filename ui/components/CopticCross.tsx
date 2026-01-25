interface CopticCrossProps {
	className?: string
	size?: number
}

export default function CopticCross({ className = '', size = 20 }: CopticCrossProps) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			className={className}
			aria-hidden="true"
		>
			{/* Coptic cross with trefoil ends and center circle */}
			<defs>
				<linearGradient id="crossGradient" x1="0%" y1="0%" x2="100%" y2="100%">
					<stop offset="0%" stopColor="#f59e0b" />
					<stop offset="100%" stopColor="#d97706" />
				</linearGradient>
			</defs>

			{/* Center circle */}
			<circle cx="12" cy="10" r="2.5" fill="url(#crossGradient)" />

			{/* Vertical beam */}
			<rect x="10.5" y="3" width="3" height="18" rx="1.5" fill="url(#crossGradient)" />

			{/* Horizontal beam */}
			<rect x="4" y="8.5" width="16" height="3" rx="1.5" fill="url(#crossGradient)" />

			{/* Top trefoil */}
			<circle cx="12" cy="3.5" r="2" fill="url(#crossGradient)" />

			{/* Left trefoil */}
			<circle cx="4.5" cy="10" r="2" fill="url(#crossGradient)" />

			{/* Right trefoil */}
			<circle cx="19.5" cy="10" r="2" fill="url(#crossGradient)" />

			{/* Bottom trefoil */}
			<circle cx="12" cy="20.5" r="2" fill="url(#crossGradient)" />
		</svg>
	)
}
