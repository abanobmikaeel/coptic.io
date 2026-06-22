import type { MetadataRoute } from 'next'

const DISALLOW = ['/api/', '/preferences', '/_next/', '/static/']

export default function robots(): MetadataRoute.Robots {
	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://coptic.io'

	return {
		rules: [
			// Known AI crawlers — welcome, but please be polite
			{
				userAgent: ['GPTBot', 'ChatGPT-User', 'OAI-SearchBot'],
				allow: '/',
				disallow: DISALLOW,
				crawlDelay: 2,
			},
			{
				userAgent: ['ClaudeBot', 'Claude-Web', 'anthropic-ai'],
				allow: '/',
				disallow: DISALLOW,
				crawlDelay: 2,
			},
			{
				userAgent: 'PerplexityBot',
				allow: '/',
				disallow: DISALLOW,
				crawlDelay: 2,
			},
			{
				userAgent: '*',
				allow: '/',
				disallow: DISALLOW,
			},
		],
		sitemap: `${baseUrl}/sitemap.xml`,
		host: baseUrl,
	}
}
