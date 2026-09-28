import { multiLangGridClass, themeClasses } from '@/lib/reading-styles'
import { ChevronIcon } from './ChevronIcon'
import type { ReadingHeaderProps } from './types'

export function ReadingHeader({
	title,
	reference,
	orderedLangs,
	labels,
	references,
	isOpen,
	theme,
	isRtl,
}: Readonly<ReadingHeaderProps>) {
	if (orderedLangs) {
		return (
			<MultiLangLayout
				orderedLangs={orderedLangs}
				labels={labels!}
				references={references!}
				isOpen={isOpen}
				theme={theme}
			/>
		)
	}

	return (
		<SingleLangLayout
			title={title!}
			reference={reference!}
			isOpen={isOpen}
			theme={theme}
			isRtl={isRtl}
		/>
	)
}

function SingleLangLayout({
	title,
	reference,
	isOpen,
	theme,
	isRtl,
}: Readonly<{
	title: string
	reference: string
	isOpen: boolean
	theme: ReadingHeaderProps['theme']
	isRtl?: boolean
}>) {
	const refColor = themeClasses.refText[theme]

	return (
		<div
			className={`${isRtl ? 'border-r-4' : 'border-l-4'} border-amber-500/60 transition-all ${themeClasses.cardBg[theme]}`}
			dir={isRtl ? 'rtl' : undefined}
		>
			<div className={`py-3 ${isRtl ? 'pr-3 pl-1' : 'pl-3 pr-1'} sm:px-3 flex items-center gap-2`}>
				<div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 min-w-0 flex-1">
					<h2
						className={`${isRtl ? 'font-arabic text-xl' : 'text-lg'} font-bold ${themeClasses.text[theme]} group-hover:text-amber-600 transition-colors`}
					>
						{title}
					</h2>
					<span className={`${isRtl ? 'font-arabic text-lg' : 'text-base'} ${refColor}`}>
						{reference}
					</span>
				</div>
				<ChevronIcon isOpen={isOpen} theme={theme} rotate={isRtl ? 'right' : 'left'} />
			</div>
		</div>
	)
}

function MultiLangLayout({
	orderedLangs,
	labels,
	references,
	isOpen,
	theme,
}: Readonly<{
	orderedLangs: NonNullable<ReadingHeaderProps['orderedLangs']>
	labels: NonNullable<ReadingHeaderProps['labels']>
	references: NonNullable<ReadingHeaderProps['references']>
	isOpen: boolean
	theme: ReadingHeaderProps['theme']
}>) {
	const refColor = themeClasses.refText[theme]

	return (
		<div className={`border-l-4 border-amber-500/60 transition-all ${themeClasses.cardBg[theme]}`}>
			<div className="py-2 px-2 sm:py-3 sm:pl-3 sm:pr-1 md:px-3">
				<div className="flex items-center gap-1 sm:gap-2">
					{/* One column per language, mirroring the content grid below so titles
					    sit above their columns. dir=ltr pins the column order under an RTL
					    locale; each cell sets its own dir. */}
					<div
						dir="ltr"
						className={`min-w-0 flex-1 grid ${multiLangGridClass(orderedLangs.length)}`}
					>
						{orderedLangs.map((lang) => {
							// Coptic has no translated title (labels.cop mirrors English), so its
							// column shows the language tag instead of repeating the title.
							if (lang === 'cop') {
								return (
									<p
										key={lang}
										className={`min-w-0 self-center text-center text-sm sm:text-base font-semibold ${themeClasses.muted[theme]}`}
									>
										Coptic
									</p>
								)
							}
							const isAr = lang === 'ar'
							return (
								<div key={lang} className="min-w-0 text-center" dir={isAr ? 'rtl' : undefined}>
									<h2
										className={`${isAr ? 'font-arabic text-lg sm:text-xl' : 'text-base sm:text-lg'} font-bold ${themeClasses.text[theme]} group-hover:text-amber-600 transition-colors`}
									>
										{labels[lang]}
									</h2>
									{references[lang] && (
										<p
											className={`${isAr ? 'font-arabic text-base sm:text-lg' : 'text-sm sm:text-base'} ${refColor}`}
										>
											{references[lang]}
										</p>
									)}
								</div>
							)
						})}
					</div>
					<ChevronIcon isOpen={isOpen} theme={theme} rotate="left" />
				</div>
			</div>
		</div>
	)
}
