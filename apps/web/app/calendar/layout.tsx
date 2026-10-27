import type { Metadata } from 'next'

export const metadata: Metadata = {
	title: 'Coptic Calendar',
	description:
		'Browse the Coptic Orthodox calendar: fasting periods, Coptic dates, and daily readings throughout the year.',
	openGraph: {
		title: 'Coptic Calendar',
		description:
			'Browse the Coptic Orthodox calendar: fasting periods, Coptic dates, and daily readings throughout the year.',
	},
}

export default function CalendarLayout({ children }: { children: React.ReactNode }) {
	return children
}
