import type { NextConfig } from 'next'
import bundleAnalyzer from '@next/bundle-analyzer'

const withBundleAnalyzer = bundleAnalyzer({
	enabled: process.env.ANALYZE === 'true',
})

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
		optimizePackageImports: ['@aws-sdk/client-ses', 'next-themes'],
	},
	compiler: {
		removeConsole: process.env.NODE_ENV === 'production',
	},
	// Target modern browsers to reduce polyfills
	transpilePackages: [],
	poweredByHeader: false,
	compress: true,
}

export default withBundleAnalyzer(nextConfig)
