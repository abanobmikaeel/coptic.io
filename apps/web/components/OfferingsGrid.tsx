import { OFFERINGS, type OfferingIcon } from '@/lib/offerings'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import CopticCross from './CopticCross'
import { BookIcon, CalendarIcon, ClockIcon, PersonIcon, SunIcon } from './ui/Icons'

function OfferingGlyph({ name }: { name: OfferingIcon }) {
	const cls = 'w-5 h-5'
	switch (name) {
		case 'clock':
			return <ClockIcon className={cls} />
		case 'sun':
			return <SunIcon className={cls} />
		case 'person':
			return <PersonIcon className={cls} />
		case 'calendar':
			return <CalendarIcon className={cls} />
		case 'cross':
			return <CopticCross size={20} />
		default:
			return <BookIcon className={cls} />
	}
}

interface OfferingsGridProps {
	/** Limit to a single pillar (e.g. 'pray' for the /pray landing). */
	pillar?: 'read' | 'pray'
	/** Include Lent-only offerings (the Lent Guide) — set true during Great Lent. */
	lent?: boolean
	className?: string
}

export async function OfferingsGrid({ pillar, lent = false, className = '' }: OfferingsGridProps) {
	const t = await getTranslations('nav')
	const items = OFFERINGS.filter((o) => {
		if (pillar && o.pillar !== pillar) return false
		if (o.seasonal === 'lent' && !lent) return false
		return true
	})

	return (
		<div className={`grid grid-cols-2 md:grid-cols-3 gap-3 ${className}`}>
			{items.map((o) => (
				<Link
					key={o.href}
					href={o.href}
					className="group flex flex-col gap-2 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-amber-300 dark:hover:border-amber-700 hover:shadow-sm transition-all"
				>
					<span className="w-9 h-9 flex items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-500">
						<OfferingGlyph name={o.icon} />
					</span>
					<span className="text-[15px] font-semibold text-gray-900 dark:text-white">
						{t(o.labelKey)}
					</span>
					<span className="text-[13px] text-gray-500 dark:text-gray-400 leading-snug">
						{t(o.descriptionKey)}
					</span>
				</Link>
			))}
		</div>
	)
}
