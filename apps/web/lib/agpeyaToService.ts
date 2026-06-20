import type { CopticDate, IncenseSection, IncenseService, Verse } from './types'

/**
 * Adapts a resolved Agpeya hour (from /api/agpeya) into the generic
 * IncenseService shape so it can render through LiturgicalServiceReader, the
 * same presentation reader used by Vespers. The hour's ordered parts become a
 * flat list of sections (prayers, psalms, gospel, litanies); the midnight hour
 * flattens its three watches with a heading before each.
 */

interface AgPsalm {
	title: string
	reference: string
	verses: Verse[]
}
interface AgGospel {
	reference: string
	rubric?: string
	verses: Verse[]
}
interface AgBlock {
	title?: string
	content: string[]
	inline?: boolean
}
interface AgWatch {
	id: string
	name: string
	theme?: string
	opening?: AgBlock
	psalmsIntro?: string
	psalms?: AgPsalm[]
	gospel?: AgGospel
	litanies?: AgBlock
	closing?: AgBlock
}

export interface ResolvedAgpeyaHour {
	id: string
	name: string
	englishName?: string
	traditionalTime?: string
	introduction?: string
	opening?: AgBlock
	thanksgiving?: AgBlock
	introductoryPsalm?: AgPsalm
	psalmsIntro?: string
	psalms?: AgPsalm[]
	gospel?: AgGospel
	litanies?: AgBlock
	lordsPrayer?: AgBlock
	thanksgivingAfter?: AgBlock
	closing?: AgBlock
	watches?: AgWatch[]
}

const psalmSection = (id: string, p: AgPsalm, rubric?: string): IncenseSection => ({
	id,
	type: 'psalm',
	role: 'all',
	title: p.title,
	// Only keep the reference when it adds info beyond the title (e.g. a verse range);
	// for psalms the title is already "Psalm 50", so don't repeat it.
	reference: p.reference && p.reference !== p.title ? p.reference : undefined,
	rubric,
	verses: p.verses,
})

const gospelSection = (id: string, g: AgGospel): IncenseSection => ({
	id,
	type: 'gospel',
	role: 'all',
	title: 'Gospel',
	reference: g.reference,
	rubric: g.rubric,
	verses: g.verses,
})

const blockSection = (
	id: string,
	type: IncenseSection['type'],
	fallbackTitle: string,
	block?: AgBlock,
): IncenseSection | null => {
	if (!block || block.content.length === 0) return null
	return {
		id,
		type,
		role: 'all',
		title: block.title ?? fallbackTitle,
		content: block.content,
	}
}

const pushPsalms = (
	sections: IncenseSection[],
	psalms: AgPsalm[] | undefined,
	idPrefix: string,
	intro?: string,
) => {
	psalms?.forEach((p, i) => {
		// The "From the Psalms of David…" intro rides as a rubric on the first psalm.
		sections.push(psalmSection(`${idPrefix}-${i}`, p, i === 0 ? intro : undefined))
	})
}

const SCRIPTURE_TYPES: ReadonlySet<IncenseSection['type']> = new Set([
	'psalm',
	'gospel',
	'daily-psalm',
])

export function agpeyaToService(
	hour: ResolvedAgpeyaHour,
	date: string,
	copticDate: CopticDate,
	opts: { scriptureOnly?: boolean } = {},
): IncenseService {
	const sections: IncenseSection[] = []
	const add = (s: IncenseSection | null) => {
		if (s) sections.push(s)
	}

	add(blockSection('opening', 'prayer', 'Opening Prayer', hour.opening))
	add(blockSection('thanksgiving', 'prayer', 'Thanksgiving', hour.thanksgiving))
	if (hour.introductoryPsalm) add(psalmSection('intro-psalm', hour.introductoryPsalm))

	if (hour.watches?.length) {
		// Midnight: flatten each watch behind a heading section.
		hour.watches.forEach((watch, wi) => {
			add({
				id: `watch-${watch.id}`,
				type: 'prayer',
				role: 'all',
				title: watch.name,
				content: watch.theme ? [watch.theme] : [],
			})
			if (watch.opening)
				add(blockSection(`watch-${watch.id}-opening`, 'prayer', 'Prayer', watch.opening))
			pushPsalms(sections, watch.psalms, `watch-${wi}-psalm`, watch.psalmsIntro)
			if (watch.gospel) add(gospelSection(`watch-${watch.id}-gospel`, watch.gospel))
			add(blockSection(`watch-${watch.id}-litanies`, 'litany', 'Litanies', watch.litanies))
			add(blockSection(`watch-${watch.id}-closing`, 'prayer', 'Closing', watch.closing))
		})
	} else {
		pushPsalms(sections, hour.psalms, 'psalm', hour.psalmsIntro)
		if (hour.gospel) add(gospelSection('gospel', hour.gospel))
		add(blockSection('litanies', 'litany', 'Litanies', hour.litanies))
		add(blockSection('lords-prayer', 'prayer', "The Lord's Prayer", hour.lordsPrayer))
		add(blockSection('thanksgiving-after', 'prayer', 'Thanksgiving', hour.thanksgivingAfter))
	}

	add(blockSection('closing', 'prayer', 'Closing Prayer', hour.closing))

	// Coptic prose isn't available, so a Coptic column only makes sense for
	// scripture (psalms + gospel) — drop everything else for that language.
	const finalSections = opts.scriptureOnly
		? sections.filter((s) => SCRIPTURE_TYPES.has(s.type))
		: sections

	return {
		type: 'agpeya',
		name: hour.name,
		date,
		copticDate,
		sections: finalSections,
	}
}
