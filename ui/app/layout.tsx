import type { Metadata } from "next";
import { Inter, Playfair_Display, Noto_Sans_Coptic } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Analytics } from "@vercel/analytics/next"

const inter = Inter({
	variable: "--font-inter",
	subsets: ["latin"],
	display: "swap",
});

const playfair = Playfair_Display({
	variable: "--font-playfair",
	subsets: ["latin"],
	display: "swap",
});

const notoSansCoptic = Noto_Sans_Coptic({
	variable: "--font-coptic",
	weight: "400",
	subsets: ["coptic"],
	display: "swap",
});

export const metadata: Metadata = {
	title: "Coptic Calendar - Daily Readings & Feast Days",
	description: "Access the Coptic Orthodox liturgical calendar, daily scripture readings, feast days, and fasting periods through our modern API.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const apiDomain = process.env.NEXT_PUBLIC_API_URL
		? new URL(process.env.NEXT_PUBLIC_API_URL).origin
		: 'https://copticio-production.up.railway.app';

	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<link rel="preconnect" href={apiDomain} />
				<link rel="dns-prefetch" href={apiDomain} />
			</head>
			<body className={`${inter.variable} ${playfair.variable} ${notoSansCoptic.variable} antialiased`}>
				<ThemeProvider>
					<div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
						<Navbar />
						{children}
					</div>
				</ThemeProvider>
				<Analytics />
			</body>
		</html>
	);
}
