import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://coptic.io'

	return {
		rules: {
			userAgent: '*',
			allow: '/',
			disallow: ['/api/', '/preferences'],
		},
		sitemap: `${baseUrl}/sitemap.xml`,
	}
}
