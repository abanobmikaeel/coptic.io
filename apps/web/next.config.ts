import bundleAnalyzer from '@next/bundle-analyzer'
import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withBundleAnalyzer = bundleAnalyzer({
	enabled: process.env.ANALYZE === 'true',
})

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'upload.wikimedia.org',
			},
		],
	},
	experimental: {
		optimizePackageImports: ['next-themes'],
	},
	compiler: {
		removeConsole: process.env.NODE_ENV === 'production',
	},
	// Target modern browsers to reduce polyfills
	transpilePackages: [],
	poweredByHeader: false,
	compress: true,
	// Email subscriptions are served by the API. Proxy the old same-origin paths so the
	// forms, emailed links and the SES webhook keep working unchanged.
	async rewrites() {
		const api = process.env.NEXT_PUBLIC_API_URL || 'https://api.coptic.io/api'
		return ['subscribe', 'verify', 'unsubscribe', 'preferences', 'webhooks/ses'].map((path) => ({
			source: `/api/${path}`,
			destination: `${api}/subscriptions/${path}`,
		}))
	},
	async headers() {
		return [
			{
				// Vendored font files are content-addressed, so they never change in place
				source: '/fonts/google/:file*',
				headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
			},
		]
	},
}

export default withBundleAnalyzer(withNextIntl(nextConfig))
