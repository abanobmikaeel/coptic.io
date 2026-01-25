import type { Metadata } from 'next'

export const metadata: Metadata = {
	title: 'API Examples',
	description:
		'Interactive examples to explore the Coptic Calendar API. Try live requests for readings, calendar conversions, fasting status, and more.',
	openGraph: {
		title: 'API Examples | Coptic Calendar',
		description: 'Interactive examples to explore the Coptic Calendar API with live requests.',
	},
}

export default function ExamplesLayout({ children }: { children: React.ReactNode }) {
	return children
}
