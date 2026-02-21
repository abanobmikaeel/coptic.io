import { getServiceName } from '@/i18n/content-translations'
import { themeClasses } from '@/lib/reading-styles'
import { ChevronIcon } from './ChevronIcon'
import type { MultiLangHeaderProps } from './types'

export function MultiLangHeader({
	orderedLangs,
	labels,
	references,
	service,
	isOpen,
	theme,
}: MultiLangHeaderProps) {
	// Dynamic grid columns based on number of languages
	const gridCols =
		orderedLangs.length === 4
			? 'grid-cols-4'
			: orderedLangs.length === 3
				? 'grid-cols-3'
				: 'grid-cols-2'

	return (
		<div className={`transition-all ${themeClasses.cardBg[theme]}`}>
			<div className="flex items-center">
				{/* Dynamic column header matching content grid */}
				<div className={`flex-1 grid ${gridCols} gap-1 sm:gap-3`}>
					{orderedLangs.map((lang) => {
						const isRtl = lang === 'ar'
						const isCoptic = lang === 'cop'

						// Coptic doesn't need its own header - just show a minimal label
						if (isCoptic) {
							return (
								<div
									key={lang}
									className="border-l-4 pl-2 py-1.5 text-left border-amber-500/60 flex items-center"
								>
									<p
										className={`text-[10px] tracking-widest uppercase font-semibold ${themeClasses.muted[theme]}`}
									>
										Coptic
									</p>
								</div>
							)
						}

						return (
							<div
								key={lang}
								className={`${isRtl ? 'border-r-4 pr-2 text-right' : 'border-l-4 pl-2 text-left'} border-amber-500/60 py-1.5`}
								dir={isRtl ? 'rtl' : 'ltr'}
							>
								{/* Service label */}
								{service && (
									<p
										className={`${isRtl ? 'text-[10px] font-arabic' : 'text-[9px] tracking-widest uppercase'} font-semibold ${themeClasses.muted[theme]}`}
									>
										{getServiceName(service, lang)}
									</p>
								)}
								<h2
									className={`text-sm font-bold ${themeClasses.text[theme]} group-hover:text-amber-600 transition-colors ${isRtl ? 'font-arabic' : ''} leading-tight`}
								>
									{labels[lang]}
								</h2>
								<p
									className={`${isRtl ? 'text-xs' : 'text-[11px]'} ${theme === 'sepia' ? 'text-amber-700' : 'text-amber-600/80'} ${isRtl ? 'font-arabic' : ''} leading-tight`}
								>
									{references[lang]}
								</p>
							</div>
						)
					})}
				</div>

				{/* Collapse indicator on the right */}
				<div className="pl-0.5 sm:px-2 flex items-center shrink-0">
					<ChevronIcon isOpen={isOpen} theme={theme} rotate="left" />
				</div>
			</div>
		</div>
	)
}
