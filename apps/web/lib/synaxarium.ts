/** Strip the trailing period many synaxarium entry names carry, for clean lists. */
export function cleanEntryName(name: string): string {
	return name.replace(/\s*\.\s*$/, '').trim()
}

/** Plain-text description of a day's commemorations, for metadata + structured data. */
export function describeSynaxarium(copticDate: string, names: string[]): string {
	return names.length
		? `Lives of the saints commemorated on ${copticDate} in the Coptic Orthodox Synaxarium: ${names.join('; ')}.`
		: `Coptic Orthodox Synaxarium commemorations for ${copticDate}.`
}

/**
 * schema.org structured data for a synaxarium day page: an Article about the
 * commemorated saints plus a BreadcrumbList locating the page in the site.
 */
export function buildSynaxariumJsonLd({
	copticDate,
	names,
	canonicalUrl,
	baseUrl,
}: {
	copticDate: string
	names: string[]
	canonicalUrl: string
	baseUrl: string
}) {
	return {
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'Article',
				'@id': `${canonicalUrl}#article`,
				headline: `Coptic Synaxarium — ${copticDate}`,
				description: describeSynaxarium(copticDate, names),
				inLanguage: 'en',
				image: `${canonicalUrl}/opengraph-image`,
				mainEntityOfPage: canonicalUrl,
				isPartOf: { '@type': 'WebSite', name: 'Coptic Calendar', url: baseUrl },
				publisher: {
					'@type': 'Organization',
					name: 'Coptic.io',
					url: baseUrl,
					logo: { '@type': 'ImageObject', url: `${baseUrl}/opengraph-image` },
				},
				about: names.map((name) => ({ '@type': 'Thing', name })),
			},
			{
				'@type': 'BreadcrumbList',
				itemListElement: [
					{ '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
					{ '@type': 'ListItem', position: 2, name: 'Synaxarium', item: `${baseUrl}/synaxarium` },
					{ '@type': 'ListItem', position: 3, name: copticDate, item: canonicalUrl },
				],
			},
		],
	}
}
