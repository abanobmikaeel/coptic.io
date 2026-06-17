/**
 * Single source of truth for the site's top-level navigation.
 *
 * Both the desktop Navbar and the MobileMenu consume these groups so the
 * structure stays in sync. Grouping is intent-based:
 *   - read : study/reading surfaces
 *   - pray : liturgical prayer services
 *   - more : account + meta (utility "gear" menu)
 * Calendar is intentionally a standalone top-level link, not a group.
 */

export interface NavItem {
	label: string
	description: string
	href: string
}

export interface NavGroups {
	read: NavItem[]
	pray: NavItem[]
	more: NavItem[]
}

type Translate = (key: string) => string

export function getNavGroups(t: Translate): NavGroups {
	return {
		read: [
			{ label: t('katamaros'), description: t('katamarosDescription'), href: '/readings' },
			{ label: t('lent'), description: t('lentDescription'), href: '/lent' },
			{ label: t('synaxarium'), description: t('synaxariumDescription'), href: '/synaxarium' },
			{ label: t('library'), description: t('libraryDescription'), href: '/library' },
		],
		pray: [
			{ label: t('agpeya'), description: t('agpeyaDescription'), href: '/agpeya' },
			{ label: t('vespers'), description: t('vespersDescription'), href: '/vespers' },
		],
		more: [
			{ label: t('subscribe'), description: t('subscribeDescription'), href: '/subscribe' },
			{ label: t('settings'), description: t('settingsDescription'), href: '/settings' },
			{ label: t('developers'), description: t('developersDescription'), href: '/docs' },
			{ label: t('privacy'), description: t('privacyDescription'), href: '/privacy' },
		],
	}
}

export const CALENDAR_HREF = '/calendar'
