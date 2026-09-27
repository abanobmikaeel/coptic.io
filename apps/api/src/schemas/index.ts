import { z } from 'zod'

// Common schemas
export const CopticDateSchema = z.object({
	dateString: z.string(),
	day: z.number(),
	month: z.number(),
	year: z.number(),
	monthString: z.string(),
})

export const CelebrationSchema = z.object({
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

export const SynaxariumEntrySchema = z
	.object({
		url: z.string().optional(),
		name: z.string().optional(),
		text: z.string().optional(),
	})
	.loose()

export const ErrorSchema = z.object({
	error: z.string(),
})

// Response schemas
export const FastingResponseSchema = z.object({
	isFasting: z.boolean(),
	fastType: z.string().nullable(),
	description: z.string().nullable(),
})

export const FastingDaySchema = z.object({
	date: z.string(),
	copticDate: CopticDateSchema,
	fastType: z.string(),
	description: z.string(),
})

export const UpcomingCelebrationSchema = z.object({
	date: z.string(),
	copticDate: CopticDateSchema,
	celebrations: z.array(CelebrationSchema),
})

export const SynaxariumSearchResultSchema = z.object({
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

// Agpeya schemas - new structured format with watches support
export const AgpeyaVerseSchema = z.object({
	num: z.number(),
	text: z.string(),
})

export const AgpeyaPsalmSchema = z.object({
	title: z.string(),
	reference: z.string(),
	rubric: z.string().optional(),
	verses: z.array(AgpeyaVerseSchema),
})

export const AgpeyaGospelSchema = z.object({
	reference: z.string(),
	rubric: z.string().optional(),
	verses: z.array(AgpeyaVerseSchema),
})

export const AgpeyaPrayerSectionSchema = z.object({
	title: z.string().optional(),
	content: z.array(z.string()),
	inline: z.boolean().optional(),
})

export const AgpeyaLitanySchema = z.object({
	title: z.string().optional(),
	content: z.array(z.string()),
})

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
})

// A section of midnight's ending: a prose prayer or the resolved midnight Gospel.
const AgpeyaMidnightTailSchema = z.discriminatedUnion('kind', [
	AgpeyaProseEntrySchema,
	AgpeyaGospelSchema.extend({
		id: z.string(),
		kind: z.literal('gospel'),
		title: z.string().optional(),
	}),
])

const AgpeyaScriptureEntrySchema = AgpeyaGospelSchema.extend({
	id: z.string(),
	kind: z.enum(['psalm', 'intro-psalm', 'gospel']),
	title: z.string().optional(),
})

// A line in `sections`: plain text, or an attributed line; a litany response carries
// its Coptic form beside the translation.
const AgpeyaLineSchema = z.union([
	z.string(),
	z.object({
		text: z.string(),
		speaker: z.enum(['Priest', 'Deacon', 'People']).optional(),
		isRubric: z.boolean().optional(),
		isResponse: z.boolean().optional(),
		coptic: z.string().optional(),
	}),
])

const AgpeyaLeafEntrySchema = z.union([
	AgpeyaProseEntrySchema.extend({ content: z.array(AgpeyaLineSchema) }),
	AgpeyaScriptureEntrySchema,
])

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
				psalmsIntro: z.string().optional(),
				sections: z.array(AgpeyaLeafEntrySchema),
			}),
		]),
	)
	.describe('The whole hour in prayed order.')

// Watch schema for midnight prayers
export const AgpeyaWatchSchema = z.object({
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

// Standard hour schema (non-midnight)
export const AgpeyaHourSchema = z.object({
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

// Midnight hour schema with watches
export const AgpeyaMidnightHourSchema = z.object({
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

// Union schema for any hour type
export const AgpeyaAnyHourSchema = z.union([AgpeyaHourSchema, AgpeyaMidnightHourSchema])

// Incense schemas — derive role enum from the data package type so they can't drift
import type { IncenseSectionRole } from '@coptic/data/en/incense'
const INCENSE_ROLES = ['all', 'priest', 'deacon', 'congregation'] as const satisfies [
	IncenseSectionRole,
	...IncenseSectionRole[],
]
const IncenseSectionRoleSchema = z.enum(INCENSE_ROLES)

export const IncensePrayerSectionSchema = z.object({
	id: z.string(),
	type: z.enum(['prayer', 'litany', 'creed']),
	role: IncenseSectionRoleSchema,
	title: z.string(),
	rubric: z.string().optional(),
	// Offered as an extra (Matins litanies, out-of-season nature litanies) — readers hide
	// these by default and surface them as addable prayers.
	optional: z.boolean().optional(),
	content: z.array(
		z.union([
			z.string(),
			z.object({
				speaker: z.string().optional(),
				text: z.string(),
				isRubric: z.boolean().optional(),
			}),
		]),
	),
})

export const IncensePsalmSectionSchema = z.object({
	id: z.string(),
	type: z.literal('psalm'),
	role: IncenseSectionRoleSchema,
	title: z.string(),
	rubric: z.string().optional(),
	reference: z.string(),
	verses: z.array(AgpeyaVerseSchema),
})

export const IncenseGospelSectionSchema = z.object({
	id: z.string(),
	type: z.literal('gospel'),
	role: IncenseSectionRoleSchema,
	title: z.string(),
	reference: z.string(),
	verses: z.array(AgpeyaVerseSchema),
})

export const IncenseSectionSchema = z.union([
	IncensePsalmSectionSchema,
	IncenseGospelSectionSchema,
	IncensePrayerSectionSchema,
])

export const IncenseResponseSchema = z.object({
	type: z.string(),
	name: z.string(),
	date: z.string(),
	copticDate: CopticDateSchema,
	sections: z.array(IncenseSectionSchema),
})

// ── Liturgy ──────────────────────────────────────────────────────────────────

export const LiturgySectionRoleSchema = z.enum(['all', 'priest', 'deacon', 'congregation'])

export const LiturgyPrayerSectionSchema = z.object({
	id: z.string(),
	type: z.enum(['prayer', 'litany', 'creed']),
	role: LiturgySectionRoleSchema,
	title: z.string(),
	// Set when a section's title falls back to another language, so the reader can
	// label it rather than passing it off as a translation.
	titleLanguage: z.string().optional(),
	rubric: z.string().optional(),
	content: z.array(
		z.union([
			z.string(),
			z.object({
				speaker: z.string().optional(),
				text: z.string(),
				isRubric: z.boolean().optional(),
			}),
		]),
	),
})

/** Psalm, epistle and gospel all come from the day's Katameros, so they share a shape. */
export const LiturgyReadingSectionSchema = z.object({
	id: z.string(),
	type: z.enum(['psalm', 'epistle', 'gospel']),
	role: LiturgySectionRoleSchema,
	title: z.string(),
	titleLanguage: z.string().optional(),
	rubric: z.string().optional(),
	reference: z.string(),
	verses: z.array(AgpeyaVerseSchema),
})

export const LiturgySectionSchema = z.union([
	LiturgyReadingSectionSchema,
	LiturgyPrayerSectionSchema,
])

export const LiturgyResponseSchema = z.object({
	type: z.string(),
	name: z.string(),
	date: z.string(),
	copticDate: CopticDateSchema,
	sections: z.array(LiturgySectionSchema),
})
