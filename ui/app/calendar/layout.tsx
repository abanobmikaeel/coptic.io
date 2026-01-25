import type { Metadata } from 'next'

export const metadata: Metadata = {
	title: 'Fasting Calendar',
	description:
		'View the Coptic Orthodox fasting calendar with all fasting periods throughout the year including Great Lent, Apostles Fast, and more.',
	openGraph: {
		title: 'Fasting Calendar | Coptic Calendar',
		description:
			'View the Coptic Orthodox fasting calendar with all fasting periods throughout the year.',
	},
}

export default function CalendarLayout({ children }: { children: React.ReactNode }) {
	return children
}
