import type { Metadata } from 'next'

export const metadata: Metadata = {
	title: 'Email Preferences',
	description: 'Manage your Coptic Calendar email subscription preferences.',
	robots: {
		index: false,
		follow: false,
	},
}

export default function PreferencesLayout({ children }: { children: React.ReactNode }) {
	return children
}
