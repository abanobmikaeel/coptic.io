import { ReadingPageLayout } from '@/components/ReadingPageLayout'
import type { ReadingTheme } from '@/lib/reading-preferences'
import { themeClasses } from '@/lib/reading-styles'
import Link from 'next/link'

interface LentNotFoundProps {
	theme: ReadingTheme
}

export function LentNotFound({ theme }: LentNotFoundProps) {
	return (
		<ReadingPageLayout theme={theme}>
			<div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
				<Link
					href="/lent"
					className={`text-sm ${themeClasses.accent[theme]} hover:underline mb-4 inline-block`}
				>
					&larr; Back to schedule
				</Link>
				<h1 className="text-2xl font-bold mb-4">No Devotional Found</h1>
				<p className={themeClasses.muted[theme]}>
					This date does not fall within Great Lent, or the devotional data is unavailable.
				</p>
			</div>
		</ReadingPageLayout>
	)
}
