import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Analytics } from "@vercel/analytics/next"

const inter = Inter({
	variable: "--font-inter",
	subsets: ["latin"]
});

const playfair = Playfair_Display({
	variable: "--font-playfair",
	subsets: ["latin"]
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
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={`${inter.variable} ${playfair.variable} antialiased min-h-screen`}>
				<ThemeProvider>
					<div className="min-h-screen">
						<Navbar />
						{children}
					</div>
				</ThemeProvider>
				<Analytics />
			</body>
		</html>
	);
}
