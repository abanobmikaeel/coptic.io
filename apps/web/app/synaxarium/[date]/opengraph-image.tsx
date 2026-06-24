import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { getSynaxariumByCopticDate } from '@/lib/api'
import { canonicalizeCopticDate, copticDateFromSegment } from '@/lib/coptic-dates'
import { cleanEntryName } from '@/lib/synaxarium'
import { ImageResponse } from 'next/og'

export const alt = 'Coptic Synaxarium'
// 2x the 1200x630 OG standard so it stays crisp on high-DPI / when platforms upscale.
export const size = { width: 2400, height: 1260 }
export const contentType = 'image/png'

// The Coptic liturgical serif gives the card an authentic, "designed" feel with
// no custom artwork. Loaded lazily so a missing file can't break the build.
let copticFont: Buffer | null | undefined
function getCopticFont(): Buffer | null {
	if (copticFont === undefined) {
		try {
			copticFont = readFileSync(join(process.cwd(), 'public/fonts/FreeSerifAvvaShenouda.ttf'))
		} catch {
			copticFont = null
		}
	}
	return copticFont
}

const MAX_NAMES = 3

export default async function Image({ params }: { params: Promise<{ date: string }> }) {
	const { date } = await params
	const copticDate =
		canonicalizeCopticDate(copticDateFromSegment(date)) ?? copticDateFromSegment(date)
	const entries = (await getSynaxariumByCopticDate(copticDate)) ?? []
	const names = entries.map((entry) => cleanEntryName(entry.name))
	const shown = names.slice(0, MAX_NAMES)
	const remaining = names.length - shown.length

	const font = getCopticFont()

	return new ImageResponse(
		<div
			style={{
				position: 'relative',
				width: '100%',
				height: '100%',
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'space-between',
				padding: '128px 160px',
				background: 'linear-gradient(135deg, #1b2536 0%, #0b1220 100%)',
				fontFamily: 'sans-serif',
			}}
		>
			{/* Left accent rule */}
			<div
				style={{
					position: 'absolute',
					left: 0,
					top: 0,
					bottom: 0,
					width: 24,
					background: '#d97706',
				}}
			/>

			{/* Coptic cross — fully contained, low-opacity motif */}
			<div style={{ position: 'absolute', right: 180, top: 420, display: 'flex', opacity: 0.07 }}>
				<svg viewBox="0 0 100 100" width="520" height="520" aria-hidden="true">
					<g transform="translate(50, 50) scale(0.30) translate(-63.9, -85.2)">
						<polygon
							fill="#f59e0b"
							points="63.9,-38.34 80.94,-8.52 115.02,-8.52 89.46,21.3 89.46,59.64 127.8,59.64 157.62,34.08 157.62,68.16 187.44,85.2 157.62,102.24 157.62,136.32 127.8,110.76 89.46,110.76 89.46,149.1 115.02,178.92 80.94,178.92 63.9,208.74 46.86,178.92 12.78,178.92 38.34,149.1 38.34,110.76 0,110.76 -29.82,136.32 -29.82,102.24 -59.64,85.2 -29.82,68.16 -29.82,34.08 0,59.64 38.34,59.64 38.34,21.3 12.78,-8.52 46.86,-8.52"
						/>
					</g>
				</svg>
			</div>

			{/* Eyebrow */}
			<div style={{ display: 'flex', alignItems: 'center' }}>
				<div
					style={{
						width: 96,
						height: 96,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						background: '#d97706',
						borderRadius: 22,
						marginRight: 32,
					}}
				>
					<svg viewBox="0 0 100 100" width="64" height="64" role="img" aria-label="Coptic Calendar">
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
					</svg>
				</div>
				<div style={{ fontSize: 44, letterSpacing: 12, color: '#f59e0b' }}>COPTIC SYNAXARIUM</div>
			</div>

			{/* Date + commemorations */}
			<div style={{ display: 'flex', flexDirection: 'column', maxWidth: 1480 }}>
				<div
					style={{
						fontSize: 156,
						color: 'white',
						lineHeight: 1.0,
						marginBottom: 44,
						fontFamily: font ? 'Coptic' : 'serif',
					}}
				>
					{copticDate}
				</div>
				<div
					style={{
						width: 128,
						height: 8,
						background: '#d97706',
						borderRadius: 4,
						marginBottom: 44,
					}}
				/>
				<div style={{ display: 'flex', flexDirection: 'column' }}>
					{shown.map((name) => (
						<div
							key={name}
							style={{ fontSize: 52, color: '#e5e7eb', lineHeight: 1.25, marginBottom: 14 }}
						>
							{name}
						</div>
					))}
					{remaining > 0 && (
						<div style={{ fontSize: 44, color: '#9ca3af', marginTop: 10 }}>
							{`+ ${remaining} more commemoration${remaining > 1 ? 's' : ''}`}
						</div>
					)}
				</div>
			</div>

			{/* Footer */}
			<div style={{ display: 'flex', fontSize: 42, color: '#d97706' }}>coptic.io</div>
		</div>,
		{
			...size,
			fonts: font ? [{ name: 'Coptic', data: font, style: 'normal', weight: 400 }] : undefined,
		},
	)
}
