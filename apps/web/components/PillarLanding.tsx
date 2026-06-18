import { OfferingsGrid } from './OfferingsGrid'

interface PillarLandingProps {
	pillar: 'read' | 'pray'
	title: string
	tagline: string
	/** Include Lent-only offerings (Great Lent). */
	lent?: boolean
}

/** Shared layout for the Read / Pray pillar landing pages. */
export function PillarLanding({ pillar, title, tagline, lent = false }: PillarLandingProps) {
	return (
		<main className="min-h-screen px-6 pt-16 pb-20">
			<div className="max-w-4xl mx-auto">
				<header className="text-center mb-10">
					<h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
						{title}
					</h1>
					<p className="mt-3 text-gray-600 dark:text-gray-400">{tagline}</p>
				</header>
				<OfferingsGrid pillar={pillar} lent={lent} />
			</div>
		</main>
	)
}
