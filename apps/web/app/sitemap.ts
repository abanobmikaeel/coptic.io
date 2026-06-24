import { copticDateSegments } from '@/lib/coptic-dates'
import type { MetadataRoute } from 'next'

type ChangeFrequency = MetadataRoute.Sitemap[number]['changeFrequency']

/**
 * Public, indexable routes. Keep this list in sync when adding top-level pages.
 * Utility/personal pages (/settings, /preferences) are intentionally excluded
 * and also disallowed in robots.ts.
 */
const ROUTES: Array<{ path: string; priority: number; changeFrequency: ChangeFrequency }> = [
	{ path: '', priority: 1, changeFrequency: 'daily' },
	// Core daily content
	{ path: '/readings', priority: 0.9, changeFrequency: 'daily' },
	{ path: '/synaxarium', priority: 0.9, changeFrequency: 'daily' },
	{ path: '/calendar', priority: 0.8, changeFrequency: 'daily' },
	// Prayer services
	{ path: '/vespers', priority: 0.8, changeFrequency: 'daily' },
	{ path: '/agpeya', priority: 0.8, changeFrequency: 'weekly' },
	{ path: '/lent', priority: 0.7, changeFrequency: 'daily' },
	// Landing / browse surfaces
	{ path: '/read', priority: 0.6, changeFrequency: 'weekly' },
	{ path: '/pray', priority: 0.6, changeFrequency: 'weekly' },
	{ path: '/library', priority: 0.6, changeFrequency: 'weekly' },
	// Meta
	{ path: '/subscribe', priority: 0.7, changeFrequency: 'monthly' },
	{ path: '/docs', priority: 0.6, changeFrequency: 'weekly' },
	{ path: '/examples', priority: 0.5, changeFrequency: 'weekly' },
	{ path: '/privacy', priority: 0.3, changeFrequency: 'yearly' },
]

export default function sitemap(): MetadataRoute.Sitemap {
	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://coptic.io'
	const lastModified = new Date()

	const staticEntries: MetadataRoute.Sitemap = ROUTES.map(
		({ path, priority, changeFrequency }) => ({
			url: `${baseUrl}${path}`,
			lastModified,
			changeFrequency,
			priority,
		}),
	)

	// Per-day synaxarium content — evergreen (same every year), high long-tail SEO value.
	const synaxariumEntries: MetadataRoute.Sitemap = copticDateSegments().map((segment) => ({
		url: `${baseUrl}/synaxarium/${segment}`,
		lastModified,
		changeFrequency: 'yearly',
		priority: 0.6,
	}))

	return [...staticEntries, ...synaxariumEntries]
}
