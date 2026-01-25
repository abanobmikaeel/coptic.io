import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'upload.wikimedia.org',
			},
		],
	},
	turbopack: {
		root: __dirname,
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

export default nextConfig
