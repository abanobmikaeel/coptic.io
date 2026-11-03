import { z } from 'zod'
import { BIBLE_TRANSLATIONS, READING_SLOTS, type ReadingSlot } from '../types'

// Common schemas
export const CopticDateSchema = z
	.object({
		dateString: z.string(),
		day: z.number(),
		month: z.number(),
		year: z.number(),
		monthString: z.string(),
	})
	.meta({ id: 'CopticDate' })

export const CelebrationSchema = z
	.object({
		id: z.number(),
		name: z.string(),
		type: z.string().meta({
			deprecated: true,
			description:
				"Kept for existing clients; use `category`. Values are inconsistent: most fixed feasts are 'feast', the Annunciation is 'lordlyFeast', moveable feasts are 'majorFeast' or 'minorFeast'.",
		}),
		category: z.enum(['majorFeast', 'minorFeast', 'otherFeast', 'fast', 'commemoration']).meta({
			description:
				'majorFeast and minorFeast are the seven major and seven minor feasts of the Lord; otherFeast is any other feast (St. Mary, the saints, the Cross, Nayrouz); commemoration is the monthly observance of the 29th.',
		}),
		isMoveable: z.boolean().optional(),
		month: z.string().optional(),
		/** Celebrated from its eve (Nativity, Theophany, Resurrection) */
		celebratedOnEve: z.boolean().optional(),
	})
	.meta({ id: 'Celebration' })

export const SynaxariumEntrySchema = z
	.object({
		id: z.string(),
		name: z.string(),
		url: z.string(),
		text: z.string().optional().meta({ description: 'Present when `detailed` is set' }),
		sourceRef: z.string().optional(),
	})
	.meta({ id: 'SynaxariumEntry' })

export const ErrorSchema = z
	.object({
		error: z.string(),
	})
	.meta({ id: 'Error' })

// Response schemas
export const FastingResponseSchema = z
	.object({
		isFasting: z.boolean(),
		fastType: z.string().nullable(),
		description: z.string().nullable(),
	})
	.meta({ id: 'FastingResponse' })

export const FastingDaySchema = z
	.object({
		date: z.string(),
		copticDate: CopticDateSchema,
		fastType: z.string(),
		description: z.string(),
	})
	.meta({ id: 'FastingDay' })

export const UpcomingCelebrationSchema = z
	.object({
		date: z.string(),
		copticDate: CopticDateSchema,
		celebrations: z.array(CelebrationSchema),
	})
	.meta({ id: 'UpcomingCelebration' })

export const SynaxariumSearchResultSchema = z
	.object({
		date: z.string(),
		copticDate: z.object({
			dateString: z.string(),
			day: z.number(),
			monthString: z.string(),
		}),
		entry: z.object({
			url: z.string().optional(),
			name: z.string().optional(),
		}),
	})
	.meta({ id: 'SynaxariumSearchResult' })

// Agpeya schemas - new structured format with watches support
export const AgpeyaVerseSchema = z
	.object({
		num: z.number(),
		text: z.string(),
	})
	.meta({ id: 'AgpeyaVerse' })

export const AgpeyaPsalmSchema = z
	.object({
		title: z.string(),
		reference: z.string(),
		rubric: z.string().optional(),
		verses: z.array(AgpeyaVerseSchema),
	})
	.meta({ id: 'AgpeyaPsalm' })

export const AgpeyaGospelSchema = z
	.object({
		reference: z.string(),
		rubric: z.string().optional(),
		verses: z.array(AgpeyaVerseSchema),
	})
	.meta({ id: 'AgpeyaGospel' })

export const AgpeyaPrayerSectionSchema = z
	.object({
		title: z.string().optional(),
		content: z.array(z.string()),
		inline: z.boolean().optional(),
	})
	.meta({ id: 'AgpeyaPrayerSection' })

export const AgpeyaLitanySchema = z
	.object({
		title: z.string().optional(),
		content: z.array(z.string()),
	})
	.meta({ id: 'AgpeyaLitany' })

const AgpeyaProseKindSchema = z.enum([
	'opening',
	'hour-intro',
	'come-let-us-worship',
	'thanksgiving',
	'litany',
	'lords-prayer',
	'thanksgiving-after',
	'gospel-conclusion',
	'closing',
	'conclusion',
])

const AgpeyaProseEntrySchema = AgpeyaPrayerSectionSchema.extend({
	id: z.string(),
	kind: AgpeyaProseKindSchema,
	rubric: z.string().optional(),
}).meta({ id: 'AgpeyaProseEntry' })

// A section of midnight's ending: a prose prayer or the resolved midnight Gospel.
const AgpeyaMidnightTailSchema = z
	.discriminatedUnion('kind', [
		AgpeyaProseEntrySchema,
		AgpeyaGospelSchema.extend({
			id: z.string(),
			kind: z.literal('gospel'),
			title: z.string().optional(),
		}),
	])
	.meta({ id: 'AgpeyaMidnightTail' })

const AgpeyaScriptureEntrySchema = AgpeyaGospelSchema.extend({
	id: z.string(),
	kind: z.enum(['psalm', 'intro-psalm', 'gospel']),
	title: z.string().optional(),
}).meta({ id: 'AgpeyaScriptureEntry' })

// A line in `sections`: plain text, or an attributed line; a litany response carries
// its Coptic form beside the translation.
const AgpeyaLineSchema = z
	.union([
		z.string(),
		z.object({
			text: z.string(),
			speaker: z.enum(['Priest', 'Deacon', 'People']).optional(),
			isRubric: z.boolean().optional(),
			isResponse: z.boolean().optional(),
			coptic: z.string().optional(),
		}),
	])
	.meta({ id: 'AgpeyaLine' })

const AgpeyaLeafEntrySchema = z
	.union([
		AgpeyaProseEntrySchema.extend({ content: z.array(AgpeyaLineSchema) }),
		AgpeyaScriptureEntrySchema,
	])
	.meta({ id: 'AgpeyaLeafEntry' })

// The hour in prayed order: prose carries `content`, scripture carries `verses`, and a
// Midnight watch is a group of both.
const AgpeyaSectionsSchema = z
	.array(
		z.union([
			AgpeyaLeafEntrySchema,
			z.object({
				id: z.string(),
				kind: z.literal('watch'),
				title: z.string(),
				theme: z.string().optional(),
				prayer: z.string().optional(),
				psalmsIntro: z.string().optional(),
				psalmsRubric: z.string().optional(),
				sections: z.array(AgpeyaLeafEntrySchema),
			}),
		]),
	)
	.describe('The whole hour in prayed order.')
	.meta({ id: 'AgpeyaSections' })

// Watch schema for midnight prayers
export const AgpeyaWatchSchema = z
	.object({
		id: z.string(),
		name: z.string(),
		theme: z.string(),
		opening: AgpeyaPrayerSectionSchema.optional(),
		psalms: z.array(AgpeyaPsalmSchema),
		gospel: AgpeyaGospelSchema.optional(),
		gospelConclusion: AgpeyaPrayerSectionSchema.optional(),
		litanies: AgpeyaLitanySchema.optional(),
		closing: AgpeyaPrayerSectionSchema.optional(),
		// Prayed after the litanies: Kyrie, Holy Holy Holy, the Lord's Prayer.
		conclusion: z.array(AgpeyaMidnightTailSchema).optional(),
	})
	.meta({ id: 'AgpeyaWatch' })

// Standard hour schema (non-midnight)
export const AgpeyaHourSchema = z
	.object({
		id: z.string(),
		name: z.string(),
		englishName: z.string(),
		traditionalTime: z.string(),
		introduction: z.string().optional(),
		opening: AgpeyaPrayerSectionSchema,
		hourIntro: AgpeyaPrayerSectionSchema.optional(),
		comeLetUsWorship: AgpeyaPrayerSectionSchema.optional(),
		thanksgiving: AgpeyaPrayerSectionSchema.optional(),
		psalms: z.array(AgpeyaPsalmSchema),
		gospel: AgpeyaGospelSchema,
		gospelConclusion: AgpeyaPrayerSectionSchema.optional(),
		litanies: AgpeyaLitanySchema,
		lordsPrayer: AgpeyaPrayerSectionSchema.optional(),
		thanksgivingAfter: AgpeyaPrayerSectionSchema.optional(),
		closing: AgpeyaPrayerSectionSchema.optional(),
		conclusion: z.array(AgpeyaPrayerSectionSchema.extend({ id: z.string() })).optional(),
		sections: AgpeyaSectionsSchema.optional(),
	})
	.meta({ id: 'AgpeyaHour' })

// Midnight hour schema with watches
export const AgpeyaMidnightHourSchema = z
	.object({
		id: z.literal('midnight'),
		name: z.string(),
		englishName: z.string(),
		traditionalTime: z.string(),
		introduction: z.string().optional(),
		opening: AgpeyaPrayerSectionSchema,
		watches: z.array(AgpeyaWatchSchema),
		closing: AgpeyaPrayerSectionSchema.optional(),
		// The ending tail: prose prayers and the midnight Gospel, in order.
		conclusion: z.array(AgpeyaMidnightTailSchema).optional(),
		sections: AgpeyaSectionsSchema.optional(),
	})
	.meta({ id: 'AgpeyaMidnightHour' })

// Union schema for any hour type
export const AgpeyaAnyHourSchema = z
	.union([AgpeyaHourSchema, AgpeyaMidnightHourSchema])
	.meta({ id: 'AgpeyaAnyHour' })

// Incense schemas — derive role enum from the data package type so they can't drift
import type { ContentLine, ContentSpeaker, IncenseSectionRole } from '@coptic/data/en/incense'
const INCENSE_ROLES = ['all', 'priest', 'deacon', 'congregation'] as const satisfies [
	IncenseSectionRole,
	...IncenseSectionRole[],
]
const IncenseSectionRoleSchema = z.enum(INCENSE_ROLES)

// A prayed line, derived from the data package's ContentLine so the two cannot drift
const SPEAKERS = ['Priest', 'Deacon', 'People'] as const satisfies [
	ContentSpeaker,
	...ContentSpeaker[],
]
const ContentLineSchema = z
	.object({
		speaker: z.enum(SPEAKERS).optional(),
		text: z.string(),
		isRubric: z.boolean().optional(),
		isResponse: z.boolean().optional(),
		coptic: z.string().optional(),
	})
	.meta({ id: 'ContentLine' }) satisfies z.ZodType<ContentLine>
const ContentSchema = z.array(z.union([z.string(), ContentLineSchema])).meta({ id: 'Content' })

export const IncensePrayerSectionSchema = z
	.object({
		id: z.string(),
		type: z.enum(['prayer', 'litany', 'creed']),
		role: IncenseSectionRoleSchema,
		title: z.string(),
		rubric: z.string().optional(),
		// Offered as an extra (Matins litanies, out-of-season nature litanies) — readers hide
		// these by default and surface them as addable prayers.
		optional: z.boolean().optional(),
		content: ContentSchema,
	})
	.meta({ id: 'IncensePrayerSection' })

export const IncensePsalmSectionSchema = z
	.object({
		id: z.string(),
		type: z.literal('psalm'),
		role: IncenseSectionRoleSchema,
		title: z.string(),
		rubric: z.string().optional(),
		reference: z.string(),
		verses: z.array(AgpeyaVerseSchema),
	})
	.meta({ id: 'IncensePsalmSection' })

export const IncenseGospelSectionSchema = z
	.object({
		id: z.string(),
		type: z.literal('gospel'),
		role: IncenseSectionRoleSchema,
		title: z.string(),
		reference: z.string(),
		verses: z.array(AgpeyaVerseSchema),
	})
	.meta({ id: 'IncenseGospelSection' })

export const IncenseSectionSchema = z
	.union([IncensePsalmSectionSchema, IncenseGospelSectionSchema, IncensePrayerSectionSchema])
	.meta({ id: 'IncenseSection' })

export const IncenseResponseSchema = z
	.object({
		type: z.string(),
		name: z.string(),
		date: z.string(),
		copticDate: CopticDateSchema,
		sections: z.array(IncenseSectionSchema),
	})
	.meta({ id: 'IncenseResponse' })

// ── Liturgy ──────────────────────────────────────────────────────────────────

export const LiturgySectionRoleSchema = z.enum(['all', 'priest', 'deacon', 'congregation'])

export const LiturgyPrayerSectionSchema = z
	.object({
		id: z.string(),
		type: z.enum(['prayer', 'litany', 'creed']),
		role: LiturgySectionRoleSchema,
		title: z.string(),
		// Set when a section's title falls back to another language, so the reader can
		// label it rather than passing it off as a translation.
		titleLanguage: z.enum(['en', 'ar', 'cop']).optional(),
		rubric: z.string().optional(),
		content: ContentSchema,
	})
	.meta({ id: 'LiturgyPrayerSection' })

/** Psalm, epistle and gospel all come from the day's Katameros, so they share a shape. */
export const LiturgyReadingSectionSchema = z
	.object({
		id: z.string(),
		type: z.enum(['psalm', 'epistle', 'gospel']),
		role: LiturgySectionRoleSchema,
		title: z.string(),
		titleLanguage: z.enum(['en', 'ar', 'cop']).optional(),
		rubric: z.string().optional(),
		reference: z.string(),
		verses: z.array(AgpeyaVerseSchema),
	})
	.meta({ id: 'LiturgyReadingSection' })

export const LiturgySectionSchema = z
	.union([LiturgyReadingSectionSchema, LiturgyPrayerSectionSchema])
	.meta({ id: 'LiturgySection' })

export const LiturgyResponseSchema = z
	.object({
		type: z.string(),
		name: z.string(),
		date: z.string(),
		copticDate: CopticDateSchema,
		sections: z.array(LiturgySectionSchema),
	})
	.meta({ id: 'LiturgyResponse' })

// Readings schemas

const ReadingSchema = z
	.object({
		bookName: z.string(),
		chapters: z.array(
			z.object({
				chapterNum: z.number(),
				verses: z.array(z.object({ num: z.number(), text: z.string() })),
			}),
		),
	})
	.meta({ id: 'Reading' })

// One optional field per Katameros slot, all of the same shape
const readingSlots = <T extends z.ZodType>(schema: T) =>
	Object.fromEntries(READING_SLOTS.map((slot) => [slot, schema.optional()])) as Record<
		ReadingSlot,
		z.ZodOptional<T>
	>

export const ReadingsResponseSchema = z
	.object({
		reference: z
			.object({ id: z.number().optional(), ...readingSlots(z.string()) })
			.optional()
			.meta({ description: 'Verse references per slot, when `detailed` is not set' }),
		...readingSlots(z.array(ReadingSchema).nullable()),
		Synaxarium: z.array(SynaxariumEntrySchema),
		synaxariumLanguage: z.string().optional(),
		cycle: z.enum(['jonah', 'greatLent', 'holyWeek', 'holyFifty', 'sunday', 'annual']).meta({
			description: 'The lectionary cycle the readings come from',
		}),
		readingsAvailable: z.boolean().meta({
			description: 'False when the cycle has no readings in the lectionary yet (Holy Week)',
		}),
		season: z.string().optional(),
		seasonKey: z.string().optional(),
		seasonDay: z.string().optional().meta({ example: 'Second Sunday of Baba' }),
		celebrations: z.array(CelebrationSchema).nullable(),
		fullDate: CopticDateSchema,
	})
	.meta({ id: 'ReadingsResponse' })

export const DailyVerseSchema = z
	.object({
		verse: z.object({ book: z.string(), chapter: z.number(), verse: z.number(), text: z.string() }),
		reference: z.string().meta({ example: 'John 16:33' }),
		readingSlot: z.string().meta({ example: 'LGospel' }),
		readingReference: z.string().meta({ example: 'John 16:20-33' }),
		language: z.enum(BIBLE_TRANSLATIONS),
		requestedLanguage: z.enum(BIBLE_TRANSLATIONS).optional(),
		fallback: z.boolean().optional(),
		season: z.string().optional(),
		seasonKey: z.string().optional(),
		fullDate: CopticDateSchema,
	})
	.meta({ id: 'DailyVerse' })

// Calendar and season schemas

export const CalendarMonthSchema = z
	.object({
		year: z.number(),
		month: z.number(),
		monthName: z.string(),
		days: z.array(
			z.object({
				gregorianDate: z.string(),
				copticDate: CopticDateSchema,
				fasting: FastingResponseSchema,
			}),
		),
		copticMonths: z.array(
			z.object({
				month: z.number(),
				monthString: z.string(),
				year: z.number(),
				startDay: z.number(),
			}),
		),
	})
	.meta({ id: 'CalendarMonth' })

export const IcalInfoSchema = z
	.object({
		webcalUrl: z.string(),
		httpsUrl: z.string(),
		instructions: z.object({ title: z.string(), steps: z.array(z.string()), note: z.string() }),
	})
	.meta({ id: 'IcalInfo' })

export const SeasonResponseSchema = z
	.object({
		date: z.string(),
		season: z.string(),
		description: z.string(),
		startDate: z.string().optional(),
		endDate: z.string().optional(),
		isFasting: z.boolean(),
		type: z.string().optional(),
	})
	.meta({ id: 'SeasonResponse' })

const PeriodSchema = z
	.object({
		name: z.string(),
		description: z.string(),
		startDate: z.string(),
		endDate: z.string(),
		type: z.string(),
	})
	.meta({ id: 'Period' })

export const SeasonYearSchema = z
	.object({
		year: z.number(),
		seasons: z.array(PeriodSchema.extend({ isFasting: z.boolean() })),
	})
	.meta({ id: 'SeasonYear' })

export const FastingPeriodsSchema = z
	.object({
		year: z.number(),
		fastingPeriods: z.array(PeriodSchema),
	})
	.meta({ id: 'FastingPeriods' })

// Lent devotional schemas

const LentDevotionalSchema = z
	.object({
		dayOffset: z.number().meta({ description: 'Days from Easter' }),
		dayNumber: z.number(),
		part: z.string(),
		weekNumber: z.number(),
		weekTheme: z.string(),
		day: z.string(),
		title: z.string(),
		references: z.array(z.string()),
		sermons: z
			.array(
				z.object({
					title: z.string(),
					preacher: z.string().optional(),
					youtubeUrl: z.string(),
					thumbnail: z.string().optional(),
				}),
			)
			.optional(),
		sundayHolyGospelReading: z.string().optional(),
		date: z.string(),
	})
	.meta({ id: 'LentDevotional' })

export const LentScheduleSchema = z
	.object({
		year: z.number(),
		easterDate: z.string(),
		lentStart: z.string(),
		lentEnd: z.string(),
		days: z.array(LentDevotionalSchema),
	})
	.meta({ id: 'LentSchedule' })

export const LentDaySchema = LentDevotionalSchema.extend({
	resolvedReferences: z
		.array(z.object({ reference: z.string(), readings: z.array(ReadingSchema).nullable() }))
		.optional(),
}).meta({ id: 'LentDay' })
