interface CopticCrossProps {
	className?: string
	size?: number
}

export default function CopticCross({ className = '', size = 20 }: CopticCrossProps) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 100 100"
			className={className}
			aria-hidden="true"
		>
			<rect width="100" height="100" rx="18" fill="#d97706" />

			{/* Calendar with connected pins */}
			<g
				transform="translate(50, 52)"
				fill="none"
				stroke="white"
				strokeWidth="6"
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				{/* Calendar body */}
				<rect x="-28" y="-18" width="56" height="48" rx="6" />
				{/* Top bar */}
				<line x1="-28" y1="-8" x2="28" y2="-8" />
				{/* Left pin */}
				<line x1="-12" y1="-28" x2="-12" y2="-14" />
				{/* Right pin */}
				<line x1="12" y1="-28" x2="12" y2="-14" />
			</g>

			{/* Coptic cross inside calendar */}
			<g transform="translate(50, 62) scale(0.10) translate(-63.9, -85.2)">
				<polygon
					fill="white"
					points="63.9,-38.34 80.94,-8.52 115.02,-8.52 89.46,21.3 89.46,59.64 127.8,59.64 157.62,34.08 157.62,68.16 187.44,85.2 157.62,102.24 157.62,136.32 127.8,110.76 89.46,110.76 89.46,149.1 115.02,178.92 80.94,178.92 63.9,208.74 46.86,178.92 12.78,178.92 38.34,149.1 38.34,110.76 0,110.76 -29.82,136.32 -29.82,102.24 -59.64,85.2 -29.82,68.16 -29.82,34.08 0,59.64 38.34,59.64 38.34,21.3 12.78,-8.52 46.86,-8.52"
				/>
			</g>
		</svg>
	)
}
