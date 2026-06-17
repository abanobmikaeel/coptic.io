/**
 * The product's shipped offerings, surfaced as cards on the home "Explore"
 * grid (and reusable by pillar landings like /pray). Labels and descriptions
 * reuse the existing `nav` translation keys; `icon` names map to components in
 * the Icons set (resolved by the consumer to keep this module server-safe).
 */

export type OfferingIcon = 'book' | 'clock' | 'sun' | 'person' | 'calendar' | 'cross' | 'library'

export interface Offering {
	/** nav translation key for the title */
	labelKey: string
	/** nav translation key for the description */
	descriptionKey: string
	href: string
	icon: OfferingIcon
	/** which pillar this belongs to */
	pillar: 'read' | 'pray'
	/** only surface this offering during the given season (e.g. Great Lent) */
	seasonal?: 'lent'
}

export const OFFERINGS: Offering[] = [
	{
		labelKey: 'katamaros',
		descriptionKey: 'katamarosDescription',
		href: '/readings',
		icon: 'book',
		pillar: 'read',
	},
	{
		labelKey: 'agpeya',
		descriptionKey: 'agpeyaDescription',
		href: '/agpeya',
		icon: 'clock',
		pillar: 'pray',
	},
	{
		labelKey: 'vespers',
		descriptionKey: 'vespersDescription',
		href: '/vespers',
		icon: 'sun',
		pillar: 'pray',
	},
	{
		labelKey: 'synaxarium',
		descriptionKey: 'synaxariumDescription',
		href: '/synaxarium',
		icon: 'person',
		pillar: 'read',
	},
	{
		labelKey: 'calendar',
		descriptionKey: 'calendarDescription',
		href: '/calendar',
		icon: 'calendar',
		pillar: 'read',
	},
	{
		labelKey: 'lent',
		descriptionKey: 'lentDescription',
		href: '/lent',
		icon: 'cross',
		pillar: 'read',
		seasonal: 'lent',
	},
	{
		labelKey: 'library',
		descriptionKey: 'libraryDescription',
		href: '/library',
		icon: 'library',
		pillar: 'read',
	},
]
