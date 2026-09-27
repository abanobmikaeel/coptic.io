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
// A section of an ending, in prayed order: prose (`content`) or, at Midnight, a
// gospel (`verses`).
type AgEndingSection = AgBlock & {
	id: string
	kind?: string
	rubric?: string
	reference?: string
	verses?: Verse[]
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
	// Prayed after the litanies: Kyrie, Holy Holy Holy, the Lord's Prayer.
	conclusion?: AgEndingSection[]
}

export interface ResolvedAgpeyaHour {
	id: string
	name: string
	englishName?: string
	traditionalTime?: string
	introduction?: string
	opening?: AgBlock
	// "The Beginning of the <hour> Prayer" — the hour's own opening declaration.
	hourIntro?: AgBlock
	// Prime only: the "Come, let us worship" prayer, its own section in the hour.
	comeLetUsWorship?: AgBlock
	thanksgiving?: AgBlock
	introductoryPsalm?: AgPsalm
	psalmsIntro?: string
	psalms?: AgPsalm[]
	gospel?: AgGospel
	litanies?: AgBlock
	lordsPrayer?: AgBlock
	thanksgivingAfter?: AgBlock
	closing?: AgBlock
	// Regular hours: the concluding prose prayers. Midnight: the ending tail, which
	// also carries the midnight Gospel, so a section may hold `content` or `verses`.
	conclusion?: AgEndingSection[]
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
	if (!block?.content?.length) return null
	return {
		id,
		type,
		role: 'all',
		title: block.title ?? fallbackTitle,
		content: block.content,
	}
}

const endingSection = (id: string, part: AgEndingSection): IncenseSection | null =>
	part.kind === 'gospel'
		? gospelSection(id, {
				reference: part.reference ?? '',
				rubric: part.rubric,
				verses: part.verses ?? [],
			})
		: blockSection(id, 'prayer', 'Prayer', part)

const psalmSections = (
	psalms: AgPsalm[] | undefined,
	idPrefix: string,
	intro?: string,
): IncenseSection[] =>
	// The "From the Psalms of David…" intro rides as a rubric on the first psalm.
	(psalms ?? []).map((p, i) => psalmSection(`${idPrefix}-${i}`, p, i === 0 ? intro : undefined))

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
	// The section list is addressed by id (the reader scrolls to `sections.find(s => s.id
	// === currentSectionId)`), so ids must be unique. Midnight prays Kyrie, Holy Holy
	// Holy and the Lord's Prayer twice, so the tail would otherwise collide with the
	// first copy. Keep the first occurrence's id stable and suffix later ones.
	const used = new Set<string>()
	const uniqueId = (id: string): string => {
		if (!used.has(id)) {
			used.add(id)
			return id
		}
		let n = 2
		while (used.has(`${id}-${n}`)) n++
		const next = `${id}-${n}`
		used.add(next)
		return next
	}
	const add = (s: IncenseSection | null) => {
		if (!s) return
		sections.push({ ...s, id: uniqueId(s.id) })
	}

	const opening = blockSection('opening', 'prayer', 'Opening Prayer', hour.opening)
	// The hour's catechetical note ("We pray the First Hour at sunrise,
	// commemorating…") rides as the opening section's rubric.
	if (opening && hour.introduction) opening.rubric = hour.introduction
	add(opening)
	add(blockSection('hour-intro', 'prayer', 'The Beginning of the Prayer', hour.hourIntro))
	add(blockSection('come-let-us-worship', 'prayer', 'Come, Let Us Worship', hour.comeLetUsWorship))
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
				// The theme ("Watchfulness and Vigilance") names the watch rather than
				// being prayed, so it rides as the heading's rubric. The heading then
				// carries the "From the Psalms of David…" intro as its body, which stops
				// it rendering as a slide holding nothing but a subtitle.
				rubric: watch.theme,
				content: watch.psalmsIntro ? [watch.psalmsIntro] : [],
			})
			if (watch.opening)
				add(blockSection(`watch-${watch.id}-opening`, 'prayer', 'Prayer', watch.opening))
			for (const p of psalmSections(watch.psalms, `watch-${wi}-psalm`)) add(p)
			if (watch.gospel) add(gospelSection(`watch-${watch.id}-gospel`, watch.gospel))
			add(blockSection(`watch-${watch.id}-litanies`, 'litany', 'Litanies', watch.litanies))
			add(blockSection(`watch-${watch.id}-closing`, 'prayer', 'Closing', watch.closing))
			// Each watch's own ending, prefixed so the same shared prayer in two
			// watches keeps a distinct, stable id.
			for (const part of watch.conclusion ?? []) {
				add(endingSection(`watch-${watch.id}-${part.id}`, part))
			}
		})
		// The shared ending prayed after the third watch (Kyrie, Holy Holy Holy, the
		// Lord's Prayer, the midnight Gospel, the Creed, the Absolution, the Conclusion).
		for (const part of hour.conclusion ?? []) {
			add(endingSection(part.id, part))
		}
	} else {
		for (const p of psalmSections(hour.psalms, 'psalm', hour.psalmsIntro)) add(p)
		if (hour.gospel) add(gospelSection('gospel', hour.gospel))
		add(blockSection('litanies', 'litany', 'Litanies', hour.litanies))
		add(blockSection('lords-prayer', 'prayer', "The Lord's Prayer", hour.lordsPrayer))
		add(blockSection('thanksgiving-after', 'prayer', 'Thanksgiving', hour.thanksgivingAfter))
		for (const part of hour.conclusion ?? []) add(blockSection(part.id, 'prayer', 'Prayer', part))
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
