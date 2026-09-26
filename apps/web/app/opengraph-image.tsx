import { socialImage } from '@/lib/socialImage'

export const runtime = 'edge'
export const alt = 'Coptic Calendar - Daily Readings & Feast Days'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpenGraphImage() {
	return socialImage(size)
}
