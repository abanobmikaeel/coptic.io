import type { Metadata, Viewport } from 'next'
import { Amiri, Inter, Literata, Noto_Sans_Coptic } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import { ThemeProvider } from '@/components/ThemeProvider'
import { BottomTabs } from '@/components/navigation/BottomTabs'
import { NavigationProvider } from '@/contexts/NavigationContext'
import { Analytics } from '@vercel/analytics/next'

const inter = Inter({
	variable: '--font-inter',
	subsets: ['latin'],
	display: 'swap',
})

// Literata - Google's reading font, similar to Kindle's Bookerly
const literata = Literata({
	variable: '--font-serif',
	subsets: ['latin'],
	display: 'swap',
})

const notoSansCoptic = Noto_Sans_Coptic({
	variable: '--font-coptic',
	weight: '400',
	subsets: ['coptic'],
	display: 'swap',
})

const amiri = Amiri({
	variable: '--font-arabic',
	weight: ['400', '700'],
	subsets: ['arabic'],
	display: 'swap',
})

const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://coptic.io'

export const metadata: Metadata = {
	metadataBase: new URL(siteUrl),
	title: {
		default: 'Coptic Calendar - Daily Readings & Feast Days',
		template: '%s | Coptic Calendar',
	},
	description:
		'Access the Coptic Orthodox liturgical calendar, daily scripture readings, feast days, and fasting periods. Subscribe for daily email reminders.',
	keywords: [
		'Coptic calendar',
		'Coptic Orthodox',
		'daily readings',
		'Katameros',
		'feast days',
		'fasting calendar',
		'synaxarium',
		'liturgical calendar',
	],
	authors: [{ name: 'Coptic.io' }],
	creator: 'Coptic.io',
	openGraph: {
		type: 'website',
		locale: 'en_US',
		url: siteUrl,
		siteName: 'Coptic Calendar',
		title: 'Coptic Calendar - Daily Readings & Feast Days',
		description:
			'Access the Coptic Orthodox liturgical calendar, daily scripture readings, feast days, and fasting periods.',
	},
	twitter: {
		card: 'summary_large_image',
		title: 'Coptic Calendar - Daily Readings & Feast Days',
		description:
			'Access the Coptic Orthodox liturgical calendar, daily scripture readings, feast days, and fasting periods.',
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			'max-video-preview': -1,
			'max-image-preview': 'large',
			'max-snippet': -1,
		},
	},
	alternates: {
		canonical: './',
	},
}

export const viewport: Viewport = {
	width: 'device-width',
	initialScale: 1,
	maximumScale: 1,
	userScalable: false,
	themeColor: [
		{ media: '(prefers-color-scheme: light)', color: '#ffffff' },
		{ media: '(prefers-color-scheme: dark)', color: '#030712' },
	],
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	const apiDomain = process.env.NEXT_PUBLIC_API_URL
		? new URL(process.env.NEXT_PUBLIC_API_URL).origin
		: 'https://api.coptic.io'

	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<link rel="preconnect" href={apiDomain} />
				<link rel="dns-prefetch" href={apiDomain} />
			</head>
			<body
				className={`${inter.variable} ${literata.variable} ${notoSansCoptic.variable} ${amiri.variable} antialiased overflow-x-hidden`}
			>
				<ThemeProvider>
					<NavigationProvider>
						<div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
							<Navbar />
							{children}
							<BottomTabs />
						</div>
					</NavigationProvider>
				</ThemeProvider>
				<Analytics />
			</body>
		</html>
	)
}
