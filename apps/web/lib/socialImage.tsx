import { ImageResponse } from 'next/og'
import { LogoMark } from './logoMark'

/** The shared Open Graph / Twitter card, rendered at each route's size. */
export function socialImage(size: { width: number; height: number }) {
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
					<LogoMark size={90} />
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
