'use client'

import {
	getFontClass,
	getLineHeightClass,
	getTextSizeClasses,
	getWeightClass,
	getWidthClass,
	getWordSpacingClass,
	themeClasses,
} from '@/lib/reading-styles'
import type { Reading } from '@/lib/types'
import { useState } from 'react'
import type {
	FontFamily,
	FontWeight,
	LineSpacing,
	ReadingTheme,
	ReadingWidth,
	TextSize,
	ViewMode,
	WordSpacing,
} from './DisplaySettings'

// Arabic translations for Bible book names
const arabicBookNames: Record<string, string> = {
	Genesis: 'التكوين',
	Exodus: 'الخروج',
	Leviticus: 'اللاويين',
	Numbers: 'العدد',
	Deuteronomy: 'التثنية',
	Joshua: 'يشوع',
	Judges: 'القضاة',
	Ruth: 'راعوث',
	'1 Samuel': 'صموئيل الأول',
	'2 Samuel': 'صموئيل الثاني',
	'1 Kings': 'الملوك الأول',
	'2 Kings': 'الملوك الثاني',
	'1 Chronicles': 'أخبار الأيام الأول',
	'2 Chronicles': 'أخبار الأيام الثاني',
	Ezra: 'عزرا',
	Nehemiah: 'نحميا',
	Esther: 'أستير',
	Job: 'أيوب',
	Psalms: 'المزامير',
	Psalm: 'مزمور',
	Proverbs: 'الأمثال',
	Ecclesiastes: 'الجامعة',
	'Song of Solomon': 'نشيد الأنشاد',
	Isaiah: 'إشعياء',
	Jeremiah: 'إرميا',
	Lamentations: 'مراثي إرميا',
	Ezekiel: 'حزقيال',
	Daniel: 'دانيال',
	Hosea: 'هوشع',
	Joel: 'يوئيل',
	Amos: 'عاموس',
	Obadiah: 'عوبديا',
	Jonah: 'يونان',
	Micah: 'ميخا',
	Nahum: 'ناحوم',
	Habakkuk: 'حبقوق',
	Zephaniah: 'صفنيا',
	Haggai: 'حجي',
	Zechariah: 'زكريا',
	Malachi: 'ملاخي',
	Matthew: 'متى',
	Mark: 'مرقس',
	Luke: 'لوقا',
	John: 'يوحنا',
	Acts: 'أعمال الرسل',
	Romans: 'رومية',
	'1 Corinthians': 'كورنثوس الأولى',
	'2 Corinthians': 'كورنثوس الثانية',
	Galatians: 'غلاطية',
	Ephesians: 'أفسس',
	Philippians: 'فيلبي',
	Colossians: 'كولوسي',
	'1 Thessalonians': 'تسالونيكي الأولى',
	'2 Thessalonians': 'تسالونيكي الثانية',
	'1 Timothy': 'تيموثاوس الأولى',
	'2 Timothy': 'تيموثاوس الثانية',
	Titus: 'تيطس',
	Philemon: 'فليمون',
	Hebrews: 'العبرانيين',
	James: 'يعقوب',
	'1 Peter': 'بطرس الأولى',
	'2 Peter': 'بطرس الثانية',
	'1 John': 'يوحنا الأولى',
	'2 John': 'يوحنا الثانية',
	'3 John': 'يوحنا الثالثة',
	Jude: 'يهوذا',
	Revelation: 'الرؤيا',
}

function getBookName(englishName: string, isArabic: boolean): string {
	if (!isArabic) return englishName
	return arabicBookNames[englishName] || englishName
}

// Arabic translations for service names
const arabicServiceNames: Record<string, string> = {
	Liturgy: 'القداس',
	Vespers: 'العشية',
	Matins: 'باكر',
}

function getServiceName(englishName: string, isArabic: boolean): string {
	if (!isArabic) return englishName
	return arabicServiceNames[englishName] || englishName
}

// LTR Header - English layout: [chevron] [title]
function LtrHeader({
	title,
	reference,
	service,
	isOpen,
	theme,
}: {
	title: string
	reference: string
	service?: string
	isOpen: boolean
	theme: ReadingTheme
}) {
	return (
		<div className={`py-4 px-4 border-l-4 border-amber-500/60 transition-all ${themeClasses.cardBg[theme]}`}>
			{service && (
				<p className={`text-[10px] font-semibold tracking-widest uppercase mb-2 ${themeClasses.muted[theme]}`}>
					{service}
				</p>
			)}
			<div className="flex items-center justify-between">
				<div>
					<h2 className={`text-2xl font-bold ${themeClasses.text[theme]} group-hover:text-amber-600 transition-colors`}>
						{title}
					</h2>
					<p className={`text-base mt-1 ${theme === 'sepia' ? 'text-amber-700' : 'text-amber-600/80'}`}>
						{reference}
					</p>
				</div>
				<svg
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					className={`${themeClasses.muted[theme]} transition-transform flex-shrink-0 ${isOpen ? '' : '-rotate-90'}`}
					aria-hidden="true"
				>
					<path d="m6 9 6 6 6-6" />
				</svg>
			</div>
		</div>
	)
}

// RTL Header - Arabic layout: [title] [chevron] aligned right
function RtlHeader({
	title,
	reference,
	service,
	isOpen,
	theme,
}: {
	title: string
	reference: string
	service?: string
	isOpen: boolean
	theme: ReadingTheme
}) {
	return (
		<div
			className={`py-4 px-4 border-r-4 border-amber-500/60 transition-all ${themeClasses.cardBg[theme]}`}
			dir="rtl"
		>
			{service && (
				<p className={`text-[10px] font-semibold tracking-widest uppercase mb-2 ${themeClasses.muted[theme]}`}>
					{service}
				</p>
			)}
			<div className="flex items-center justify-between">
				<div>
					<h2 className={`text-2xl font-bold ${themeClasses.text[theme]} group-hover:text-amber-600 transition-colors font-arabic`}>
						{title}
					</h2>
					<p className={`text-base mt-1 ${theme === 'sepia' ? 'text-amber-700' : 'text-amber-600/80'} font-arabic`}>
						{reference}
					</p>
				</div>
				<svg
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					className={`${themeClasses.muted[theme]} transition-transform flex-shrink-0 ${isOpen ? '' : 'rotate-90'}`}
					aria-hidden="true"
				>
					<path d="m6 9 6 6 6-6" />
				</svg>
			</div>
		</div>
	)
}

interface ScriptureReadingProps {
	readings: Reading[]
	title: string
	isRtl: boolean
	id: string
	viewMode: ViewMode
	showVerses: boolean
	textSize?: TextSize
	fontFamily?: FontFamily
	lineSpacing?: LineSpacing
	wordSpacing?: WordSpacing
	theme?: ReadingTheme
	width?: ReadingWidth
	weight?: FontWeight
	service?: string
}

export function ScriptureReading({
	readings,
	title,
	isRtl,
	id,
	viewMode,
	showVerses,
	textSize = 'md',
	fontFamily = 'sans',
	lineSpacing = 'normal',
	wordSpacing = 'normal',
	theme = 'light',
	width = 'normal',
	weight = 'normal',
	service,
}: ScriptureReadingProps) {
	const [isOpen, setIsOpen] = useState(true)

	const sizes = getTextSizeClasses(textSize, isRtl)
	const lineHeight = getLineHeightClass(lineSpacing, isRtl)
	const fontClass = getFontClass(fontFamily, isRtl)
	const weightClass = getWeightClass(weight, isRtl)
	const widthClass = getWidthClass(width)
	const wordSpacingClass = getWordSpacingClass(wordSpacing, isRtl)

	const reference = readings
		.map((reading) =>
			reading.chapters
				.map((chapter) => {
					const bookName = getBookName(reading.bookName, isRtl)
					const firstVerse = chapter.verses[0]?.num
					const lastVerse = chapter.verses[chapter.verses.length - 1]?.num
					return `${bookName} ${chapter.chapterNum}:${firstVerse}${firstVerse !== lastVerse ? `-${lastVerse}` : ''}`
				})
				.join('; '),
		)
		.join('; ')

	return (
		<article id={id} className={`scroll-mt-24 ${isOpen ? 'mb-12' : 'mb-4'}`}>
			{/* Clickable header */}
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				className="w-full group cursor-pointer"
			>
				<div className={`${widthClass} mx-auto px-4`}>
					{isRtl ? (
						<RtlHeader title={title} reference={reference} service={service ? getServiceName(service, true) : undefined} isOpen={isOpen} theme={theme} />
					) : (
						<LtrHeader title={title} reference={reference} service={service} isOpen={isOpen} theme={theme} />
					)}
				</div>
			</button>

			{/* Scripture content */}
			{isOpen && (
				<div className={`${widthClass} mx-auto mt-6 px-4`}>
					{readings.map((reading, idx) => (
						<div key={idx}>
							{reading.chapters.map((chapter, cidx) => (
								<div key={cidx} className="mb-8">
									{/* Chapter heading */}
									<h3
										className={`text-center ${sizes.chapter} font-bold tracking-wider ${themeClasses.muted[theme]} mb-10 ${isRtl ? 'font-arabic' : 'uppercase'}`}
										dir={isRtl ? 'rtl' : 'ltr'}
									>
										{getBookName(reading.bookName, isRtl)} {chapter.chapterNum}
									</h3>

									{/* Verses */}
									{viewMode === 'continuous' ? (
										<p
											className={`${fontClass} ${weightClass} ${wordSpacingClass} ${sizes.verse} ${lineHeight} ${themeClasses.text[theme]} ${isRtl ? 'text-right' : 'first-letter-large'}`}
											dir={isRtl ? 'rtl' : 'ltr'}
										>
											{chapter.verses.map((verse, vidx) => (
												<span key={verse.num}>
													{showVerses && (
														<sup
															className={`${sizes.verseNum} font-normal ${themeClasses.accent[theme]} ${isRtl ? 'ml-1.5' : 'mr-1'}`}
														>
															{verse.num}
														</sup>
													)}
													<span>{verse.text}</span>
													{vidx < chapter.verses.length - 1 && ' '}
												</span>
											))}
										</p>
									) : (
										<div
											className={`${isRtl ? 'space-y-6' : 'space-y-4'} ${isRtl ? 'text-right' : ''}`}
											dir={isRtl ? 'rtl' : 'ltr'}
										>
											{chapter.verses.map((verse, vidx) => (
												<p
													key={verse.num}
													className={`${fontClass} ${weightClass} ${wordSpacingClass} ${sizes.verse} ${lineHeight} ${themeClasses.text[theme]} ${vidx === 0 && !isRtl ? 'first-letter-large' : ''}`}
												>
													{showVerses && (
														<span
															className={`${themeClasses.accent[theme]} ${sizes.verseNum} font-normal tabular-nums ${isRtl ? 'ml-3' : 'mr-2'}`}
														>
															{verse.num}
														</span>
													)}
													{verse.text}
												</p>
											))}
										</div>
									)}
								</div>
							))}
						</div>
					))}
				</div>
			)}
		</article>
	)
}
