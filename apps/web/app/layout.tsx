import type { Metadata, Viewport } from 'next'
import { EB_Garamond, Inter, Noto_Naskh_Arabic, Noto_Sans_Coptic } from 'next/font/google'
import './globals.css'
import { CommandPaletteProvider } from '@/components/CommandPalette'
import Navbar from '@/components/Navbar'
import { ThemeProvider } from '@/components/ThemeProvider'
import { NavigationProvider } from '@/contexts/NavigationContext'
import { Analytics } from '@vercel/analytics/next'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'

const inter = Inter({
	variable: '--font-inter',
	subsets: ['latin'],
	display: 'swap',
})

// EB Garamond - Classic, elegant serif with traditional biblical feel
const ebGaramond = EB_Garamond({
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

const notoNaskhArabic = Noto_Naskh_Arabic({
	variable: '--font-arabic',
	weight: ['400', '500', '600'],
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

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	const locale = await getLocale()
	const messages = await getMessages()

	const apiDomain = process.env.NEXT_PUBLIC_API_URL
		? new URL(process.env.NEXT_PUBLIC_API_URL).origin
		: 'https://api.coptic.io'

	return (
		<html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} suppressHydrationWarning>
			<head>
				<link rel="preconnect" href={apiDomain} />
				<link rel="dns-prefetch" href={apiDomain} />
			</head>
			<body
				className={`${inter.variable} ${ebGaramond.variable} ${notoSansCoptic.variable} ${notoNaskhArabic.variable} antialiased`}
			>
				<a
					href="#main-content"
					tabIndex={0}
					className="absolute left-[-9999px] top-auto w-px h-px overflow-hidden focus:static focus:w-auto focus:h-auto focus:overflow-visible focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-6 focus:py-3 focus:bg-amber-700 focus:text-white focus:font-semibold focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
				>
					{messages.common?.skipToContent ?? 'Skip to main content'}
				</a>
				<NextIntlClientProvider messages={messages}>
					<ThemeProvider>
						<CommandPaletteProvider>
							<NavigationProvider>
								<div className="min-h-screen [overflow-x:clip] bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
									<Navbar />
									<div id="main-content">{children}</div>
								</div>
							</NavigationProvider>
						</CommandPaletteProvider>
					</ThemeProvider>
				</NextIntlClientProvider>
				<Analytics />
			</body>
		</html>
	)
}
