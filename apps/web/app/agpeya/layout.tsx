import type { Metadata } from 'next'

export const metadata: Metadata = {
	title: 'Agpeya - Book of Hours',
	description:
		'The Agpeya (Book of Hours) — the seven canonical hours of prayer in the Coptic Orthodox tradition.',
	openGraph: {
		title: 'Agpeya - Book of Hours | Coptic IO',
		description:
			'The Agpeya (Book of Hours) — the seven canonical hours of prayer in the Coptic Orthodox tradition.',
	},
}

export default function AgpeyaLayout({ children }: { children: React.ReactNode }) {
	return children
}
