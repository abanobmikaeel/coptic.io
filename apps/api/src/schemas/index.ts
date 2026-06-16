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
	type: z.string(),
	isMoveable: z.boolean().optional(),
	month: z.string().optional(),
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

// Watch schema for midnight prayers
export const AgpeyaWatchSchema = z.object({
	id: z.string(),
	name: z.string(),
	theme: z.string(),
	opening: AgpeyaPrayerSectionSchema.optional(),
	psalms: z.array(AgpeyaPsalmSchema),
	gospel: AgpeyaGospelSchema.optional(),
	litanies: AgpeyaLitanySchema.optional(),
	closing: AgpeyaPrayerSectionSchema.optional(),
})

// Standard hour schema (non-midnight)
export const AgpeyaHourSchema = z.object({
	id: z.string(),
	name: z.string(),
	englishName: z.string(),
	traditionalTime: z.string(),
	introduction: z.string().optional(),
	opening: AgpeyaPrayerSectionSchema,
	thanksgiving: AgpeyaPrayerSectionSchema.optional(),
	psalms: z.array(AgpeyaPsalmSchema),
	gospel: AgpeyaGospelSchema,
	litanies: AgpeyaLitanySchema,
	lordsPrayer: AgpeyaPrayerSectionSchema.optional(),
	thanksgivingAfter: AgpeyaPrayerSectionSchema.optional(),
	closing: AgpeyaPrayerSectionSchema,
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
	closing: AgpeyaPrayerSectionSchema,
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
