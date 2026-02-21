import { themeClasses } from '@/lib/reading-styles'
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

	// Separate LTR langs, RTL (Arabic), and Coptic
	const ltrLangs = orderedLangs.filter((l) => l !== 'ar' && l !== 'cop')
	const hasArabic = orderedLangs.includes('ar')
	const hasCoptic = orderedLangs.includes('cop')

	return (
		<div className={`border-l-4 border-amber-500/60 transition-all ${themeClasses.cardBg[theme]}`}>
			<div className="py-3 pl-3 pr-1 sm:px-3">
				{/* Service label centered above */}
				{service && (
					<p
						className={`text-[10px] font-semibold tracking-widest uppercase ${themeClasses.muted[theme]} text-center mb-1`}
					>
						{service.toUpperCase()}
					</p>
				)}
				<div className="flex items-center gap-2">
					<div className="min-w-0 flex-1 flex items-start justify-between gap-4">
						{/* Left side: LTR titles & references */}
						<div className="min-w-0">
							{ltrLangs.map((lang) => (
								<div key={lang}>
									<h2
										className={`text-base font-bold ${themeClasses.text[theme]} group-hover:text-amber-600 transition-colors`}
									>
										{labels[lang]}
									</h2>
									{references[lang] && <p className={`text-sm ${refColor}`}>{references[lang]}</p>}
								</div>
							))}
							{hasCoptic && (
								<p
									className={`text-xs tracking-widest uppercase font-semibold ${themeClasses.muted[theme]} mt-0.5`}
								>
									Coptic
								</p>
							)}
						</div>

						{/* Right side: Arabic title & reference, right-aligned */}
						{hasArabic && (
							<div className="text-right min-w-0 shrink-0" dir="rtl">
								<h2
									className={`text-base font-bold ${themeClasses.text[theme]} group-hover:text-amber-600 transition-colors font-arabic`}
								>
									{labels.ar}
								</h2>
								{references.ar && (
									<p className={`text-sm ${refColor} font-arabic`}>{references.ar}</p>
								)}
							</div>
						)}
					</div>
					<ChevronIcon isOpen={isOpen} theme={theme} rotate="left" />
				</div>
			</div>
		</div>
	)
}
