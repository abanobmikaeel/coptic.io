'use client'

import { ChevronRightIcon } from '@/components/ui/Icons'
import { useReadingSettingsContext } from '@/contexts/ReadingSettingsContext'
import type { BilingualEntry } from '@/hooks/useSynaxarium'
import type { TextSize } from '@/lib/reading-preferences'
import { useTranslations } from 'next-intl'

interface BilingualSynaxariumSectionProps {
	entries: BilingualEntry[]
	expandedEntry: string | null
	onExpandedChange: (id: string | null) => void
}

export function BilingualSynaxariumSection({
	entries,
	expandedEntry,
	onExpandedChange,
}: BilingualSynaxariumSectionProps) {
	const t = useTranslations('synaxarium')
	const { styles, typography } = useReadingSettingsContext()
	const { textSize } = typography

	// Get style classes for English (LTR) from context
	const { ltr, rtl, theme } = styles

	// Arabic sizes - slightly smaller for synaxarium balance
	const arSizes = {
		sm: { chapter: 'text-lg', verse: 'text-xl', verseNum: 'text-sm' },
		md: { chapter: 'text-xl', verse: 'text-2xl', verseNum: 'text-base' },
		lg: { chapter: 'text-2xl', verse: 'text-3xl', verseNum: 'text-lg' },
	}[textSize]

	// Title sizes based on textSize
	const titleSizes: Record<TextSize, string> = {
		sm: 'text-base',
		md: 'text-lg',
		lg: 'text-xl',
	}

	// Arabic title sizes - slightly larger for balance
	const arTitleSizes: Record<TextSize, string> = {
		sm: 'text-lg',
		md: 'text-xl',
		lg: 'text-2xl',
	}

	return (
		<ul className="space-y-4">
			{entries.map((entry) => {
				const isExpanded = expandedEntry === entry.id
				const hasText = entry.en?.text || entry.ar?.text

				return (
					<li key={entry.id} className={`border-b ${theme.border} last:border-0 pb-4 last:pb-0`}>
						{/* Entry titles - side by side */}
						<button
							type="button"
							onClick={() => onExpandedChange(isExpanded ? null : entry.id)}
							className="w-full group"
						>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6">
								{/* English title */}
								<div className="flex items-start gap-3 text-left">
									<ChevronRightIcon
										className={`w-5 h-5 mt-0.5 flex-shrink-0 ${theme.muted} transition-transform duration-200 ${
											isExpanded ? 'rotate-90' : ''
										}`}
									/>
									<span
										className={`${titleSizes[textSize]} font-medium ${theme.text} group-hover:text-amber-600 transition-colors`}
									>
										{entry.en?.name || <span className={theme.muted}>{t('noEnglish')}</span>}
									</span>
								</div>

								{/* Arabic title */}
								<div className="text-right" dir="rtl">
									<span
										className={`${arTitleSizes[textSize]} font-medium ${theme.text} group-hover:text-amber-600 transition-colors`}
									>
										{entry.ar?.name || <span className={theme.muted}>{t('noArabic')}</span>}
									</span>
								</div>
							</div>
						</button>

						{/* Expanded content - side by side */}
						{isExpanded && hasText && (
							<div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-200">
								<div
									className={`grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-0 rounded-lg overflow-hidden ${
										typography.textSize === 'lg' ? '' : ''
									} ${
										styles.theme.bg.includes('gray-900')
											? 'bg-gray-800/50'
											: styles.theme.bg.includes('sepia') || styles.theme.bg.includes('f5f0e6')
												? 'bg-amber-100/50'
												: 'bg-gray-50'
									}`}
								>
									{/* English text */}
									<div
										className={`p-4 md:border-r ${
											styles.theme.bg.includes('gray-900')
												? 'md:border-gray-700'
												: styles.theme.bg.includes('sepia') || styles.theme.bg.includes('f5f0e6')
													? 'md:border-amber-200'
													: 'md:border-gray-200'
										}`}
									>
										{entry.en?.text ? (
											<>
												<p
													className={`${ltr.font} ${ltr.weight} ${ltr.wordSpacing} ${ltr.textSize.verse} ${ltr.lineHeight} ${theme.text} whitespace-pre-line`}
												>
													{entry.en.text}
												</p>
												{entry.en.url && (
													<a
														href={entry.en.url}
														target="_blank"
														rel="noopener noreferrer"
														className={`inline-block mt-4 ${theme.accent} hover:underline text-sm`}
													>
														{t('readOnCopticChurch')}
													</a>
												)}
											</>
										) : (
											<p className={`${theme.muted} italic`}>{t('noEnglishText')}</p>
										)}
									</div>

									{/* Arabic text */}
									<div className="p-4 text-right" dir="rtl">
										{entry.ar?.text ? (
											<>
												<p
													className={`${rtl.font} ${rtl.weight} ${rtl.wordSpacing} ${arSizes.verse} ${rtl.lineHeight} ${theme.text} whitespace-pre-line`}
												>
													{entry.ar.text}
												</p>
												{entry.ar.url && (
													<a
														href={entry.ar.url}
														target="_blank"
														rel="noopener noreferrer"
														className={`inline-block mt-4 ${theme.accent} hover:underline text-sm`}
													>
														{t('readOnCopticChurch')}
													</a>
												)}
											</>
										) : (
											<p className={`${theme.muted} italic`}>{t('noArabicText')}</p>
										)}
									</div>
								</div>
							</div>
						)}
					</li>
				)
			})}
		</ul>
	)
}
