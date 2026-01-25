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
