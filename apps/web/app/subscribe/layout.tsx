import type { Metadata } from 'next'

export const metadata: Metadata = {
	title: 'Subscribe',
	description:
		'Subscribe to receive daily Coptic Orthodox scripture readings and feast day reminders directly in your inbox.',
	openGraph: {
		title: 'Subscribe | Coptic Calendar',
		description:
			'Subscribe to receive daily Coptic Orthodox scripture readings and feast day reminders.',
	},
}

export default function SubscribeLayout({ children }: { children: React.ReactNode }) {
	return children
}
