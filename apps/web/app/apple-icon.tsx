import { LogoMark } from '@/lib/logoMark'
import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
	return new ImageResponse(
		<div
			style={{
				width: '100%',
				height: '100%',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				background: '#d97706',
				borderRadius: 32,
			}}
		>
			<LogoMark size={140} />
		</div>,
		{ ...size },
	)
}
