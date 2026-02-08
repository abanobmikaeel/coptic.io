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
	const gridCols = orderedLangs.length === 3 ? 'grid-cols-3' : 'grid-cols-2'

	return (
		<div className={`py-4 transition-all ${themeClasses.cardBg[theme]}`}>
			{/* Dynamic column header matching content grid */}
			<div className={`grid ${gridCols} gap-6`}>
				{orderedLangs.map((lang) => {
					const isRtl = lang === 'ar'
					return (
						<div
							key={lang}
							className={`${isRtl ? 'border-r-4 pr-4 text-right' : 'border-l-4 pl-4 text-left'} border-amber-500/60`}
							dir={isRtl ? 'rtl' : 'ltr'}
						>
							{/* Service label */}
							{service && (
								<p
									className={`${isRtl ? 'text-sm font-arabic' : 'text-[10px] tracking-widest uppercase'} font-semibold mb-2 ${themeClasses.muted[theme]}`}
								>
									{getServiceName(service, lang)}
								</p>
							)}
							<h2
								className={`text-2xl font-bold ${themeClasses.text[theme]} group-hover:text-amber-600 transition-colors ${isRtl ? 'font-arabic' : ''}`}
							>
								{labels[lang]}
							</h2>
							<p
								className={`${isRtl ? 'text-lg' : 'text-base'} mt-1 ${theme === 'sepia' ? 'text-amber-700' : 'text-amber-600/80'} ${isRtl ? 'font-arabic' : ''}`}
							>
								{references[lang]}
							</p>
						</div>
					)
				})}
			</div>

			{/* Collapse indicator centered */}
			<div className="flex justify-center mt-3">
				<ChevronIcon isOpen={isOpen} theme={theme} rotate="left" />
			</div>
		</div>
	)
}
