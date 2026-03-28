import type { ReadingTheme } from '@/lib/reading-preferences'
import { themeClasses } from '@/lib/reading-styles'

interface Sermon {
	title: string
	preacher?: string
	youtubeUrl: string
	thumbnail?: string
}

interface LentSermonListProps {
	sermons: Sermon[]
	theme: ReadingTheme
}

export function LentSermonList({ sermons, theme }: LentSermonListProps) {
	if (sermons.length === 0) return null
	return (
		<div className="max-w-full sm:max-w-2xl mx-auto mt-10 mb-8">
			<h2
				className={`text-xs font-semibold uppercase tracking-wider ${themeClasses.muted[theme]} mb-3`}
			>
				Sermons
			</h2>
			<div className="space-y-3">
				{sermons.map((sermon) => (
					<a
						key={sermon.youtubeUrl}
						href={sermon.youtubeUrl}
						target="_blank"
						rel="noopener noreferrer"
						className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${themeClasses.border[theme]} ${themeClasses.collapsedBg[theme]}`}
					>
						{sermon.thumbnail && (
							<img
								src={sermon.thumbnail}
								alt=""
								className="w-24 h-16 rounded object-cover shrink-0"
							/>
						)}
						<div className="min-w-0">
							<p className="text-sm font-medium leading-tight">{sermon.title}</p>
							{sermon.preacher && (
								<p className={`text-xs mt-0.5 ${themeClasses.muted[theme]}`}>{sermon.preacher}</p>
							)}
						</div>
					</a>
				))}
			</div>
		</div>
	)
}
