import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Coptic Calendar - Daily Readings & Feast Days'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpenGraphImage() {
	return new ImageResponse(
		<div
			style={{
				width: '100%',
				height: '100%',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
				fontFamily: 'system-ui, sans-serif',
			}}
		>
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					marginBottom: 40,
				}}
			>
				<div
					style={{
						width: 120,
						height: 120,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						background: '#d97706',
						borderRadius: 24,
					}}
				>
					<svg viewBox="0 0 100 100" width="90" height="90">
						<g
							transform="translate(50, 52)"
							fill="none"
							stroke="white"
							strokeWidth="6"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<rect x="-28" y="-18" width="56" height="48" rx="6" />
							<line x1="-28" y1="-8" x2="28" y2="-8" />
							<line x1="-12" y1="-28" x2="-12" y2="-14" />
							<line x1="12" y1="-28" x2="12" y2="-14" />
						</g>
						<g transform="translate(50, 62) scale(0.10) translate(-63.9, -85.2)">
							<polygon
								fill="white"
								points="63.9,-38.34 80.94,-8.52 115.02,-8.52 89.46,21.3 89.46,59.64 127.8,59.64 157.62,34.08 157.62,68.16 187.44,85.2 157.62,102.24 157.62,136.32 127.8,110.76 89.46,110.76 89.46,149.1 115.02,178.92 80.94,178.92 63.9,208.74 46.86,178.92 12.78,178.92 38.34,149.1 38.34,110.76 0,110.76 -29.82,136.32 -29.82,102.24 -59.64,85.2 -29.82,68.16 -29.82,34.08 0,59.64 38.34,59.64 38.34,21.3 12.78,-8.52 46.86,-8.52"
							/>
						</g>
					</svg>
				</div>
			</div>
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
				}}
			>
				<h1
					style={{
						fontSize: 64,
						fontWeight: 700,
						color: 'white',
						margin: 0,
						marginBottom: 16,
					}}
				>
					Coptic Calendar
				</h1>
				<p
					style={{
						fontSize: 28,
						color: '#d97706',
						margin: 0,
					}}
				>
					Daily Readings & Feast Days
				</p>
			</div>
		</div>,
		{ ...size },
	)
}
