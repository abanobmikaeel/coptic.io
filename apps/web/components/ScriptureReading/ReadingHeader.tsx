import { multiLangGridClass, themeClasses } from '@/lib/reading-styles'
import { ChevronIcon } from './ChevronIcon'
import type { ReadingHeaderProps } from './types'

export function ReadingHeader({
	title,
	reference,
	orderedLangs,
	labels,
	references,
	service,
	isOpen,
	theme,
	isRtl,
}: ReadingHeaderProps) {
	const isMultiLang = !!orderedLangs

	if (isMultiLang) {
		return (
			<MultiLangLayout
				orderedLangs={orderedLangs}
				labels={labels!}
				references={references!}
				service={service}
				isOpen={isOpen}
				theme={theme}
			/>
		)
	}

	if (isRtl) {
		return (
			<SingleLangLayout
				title={title!}
				reference={reference!}
				service={service}
				isOpen={isOpen}
				theme={theme}
				isRtl
			/>
		)
	}

	return (
		<SingleLangLayout
			title={title!}
			reference={reference!}
			service={service}
			isOpen={isOpen}
			theme={theme}
		/>
	)
}

function SingleLangLayout({
	title,
	reference,
	service,
	isOpen,
	theme,
	isRtl,
}: {
	title: string
	reference: string
	service?: string
	isOpen: boolean
	theme: ReadingHeaderProps['theme']
	isRtl?: boolean
}) {
	const refColor = themeClasses.refText[theme]

	return (
		<div
			className={`${isRtl ? 'border-r-4' : 'border-l-4'} border-amber-500/60 transition-all ${themeClasses.cardBg[theme]}`}
			dir={isRtl ? 'rtl' : undefined}
		>
			<div className={`py-3 ${isRtl ? 'pr-3 pl-1' : 'pl-3 pr-1'} sm:px-3 flex items-center gap-2`}>
				<div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 min-w-0 flex-1">
					{service && (
						<span
							className={`text-[10px] font-semibold ${isRtl ? 'font-arabic' : 'tracking-widest uppercase'} ${themeClasses.muted[theme]} shrink-0`}
						>
							{service}
							<span className={`mx-1.5 ${themeClasses.muted[theme]}`}>·</span>
						</span>
					)}
					<h2
						className={`text-base font-bold ${themeClasses.text[theme]} group-hover:text-amber-600 transition-colors ${isRtl ? 'font-arabic' : ''}`}
					>
						{title}
					</h2>
					<span className={`text-sm ${refColor} ${isRtl ? 'font-arabic' : ''}`}>{reference}</span>
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
	service,
	isOpen,
	theme,
}: {
	orderedLangs: ReadingHeaderProps['orderedLangs'] & {}
	labels: NonNullable<ReadingHeaderProps['labels']>
	references: NonNullable<ReadingHeaderProps['references']>
	service?: string
	isOpen: boolean
	theme: ReadingHeaderProps['theme']
}) {
	const refColor = themeClasses.refText[theme]

	return (
		<div className={`border-l-4 border-amber-500/60 transition-all ${themeClasses.cardBg[theme]}`}>
			<div className="py-2 px-2 sm:py-3 sm:pl-3 sm:pr-1 md:px-3">
				{/* Service label centered above */}
				{service && (
					<p
						className={`text-[10px] font-semibold tracking-widest uppercase ${themeClasses.muted[theme]} text-center mb-1`}
					>
						{service.toUpperCase()}
					</p>
				)}
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
										className={`min-w-0 self-center text-center text-[10px] sm:text-xs tracking-widest uppercase font-semibold ${themeClasses.muted[theme]}`}
									>
										Coptic
									</p>
								)
							}
							const isAr = lang === 'ar'
							return (
								<div key={lang} className="min-w-0 text-center" dir={isAr ? 'rtl' : undefined}>
									<h2
										className={`text-sm sm:text-base font-bold ${themeClasses.text[theme]} group-hover:text-amber-600 transition-colors ${isAr ? 'font-arabic' : ''}`}
									>
										{labels[lang]}
									</h2>
									{references[lang] && (
										<p className={`text-xs sm:text-sm ${refColor} ${isAr ? 'font-arabic' : ''}`}>
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
