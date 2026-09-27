import type { CopticDate, IncenseContentLine, IncenseSection, IncenseService, Verse } from './types'

/**
 * Adapts an Agpeya hour from /api/agpeya into the IncenseService shape the shared
 * LiturgicalServiceReader renders. The API sends the hour in prayed order, so this
 * is a map: prose keeps its lines, scripture keeps its verses, and each Midnight
 * watch becomes a heading followed by its own sections.
 */

interface AgProse {
	id: string
	kind: string
	title?: string
	rubric?: string
	content: (string | IncenseContentLine)[]
}
interface AgScripture {
	id: string
	kind: 'psalm' | 'intro-psalm' | 'gospel'
	title?: string
	reference: string
	rubric?: string
	verses: Verse[]
}
type AgLeaf = AgProse | AgScripture
interface AgWatch {
	id: string
	kind: 'watch'
	title: string
	theme?: string
	/** The watch's offering: "The praise of the first watch… we offer unto Christ…". */
	prayer?: string
	psalmsIntro?: string
	/** Which psalms are prayed; shown on the watch's first psalm. */
	psalmsRubric?: string
	sections: AgLeaf[]
}

export interface ResolvedAgpeyaHour {
	id: string
	name: string
	/** Why the hour is prayed; shown as the opening's rubric. */
	introduction?: string
	/** "From the Psalms of our father David…"; shown on the hour's first psalm. */
	psalmsIntro?: string
	sections: (AgLeaf | AgWatch)[]
}

// Untitled sections are named by what they are.
const FALLBACK_TITLE: Record<string, string> = {
	opening: 'Opening Prayer',
	'hour-intro': 'The Beginning of the Prayer',
	'come-let-us-worship': 'Come, Let Us Worship',
	thanksgiving: 'Thanksgiving',
	litany: 'Litanies',
	'lords-prayer': "The Lord's Prayer",
	'gospel-conclusion': 'Gospel Conclusion',
	'thanksgiving-after': 'Thanksgiving',
	closing: 'Closing Prayer',
}

const isScripture = (s: AgLeaf): s is AgScripture => 'verses' in s

function toSection(id: string, s: AgLeaf, rubric?: string): IncenseSection | null {
	if (isScripture(s)) {
		if (s.kind === 'gospel') {
			return {
				id,
				type: 'gospel',
				role: 'all',
				title: s.title ?? 'Gospel',
				reference: s.reference,
				rubric: s.rubric,
				verses: s.verses,
			}
		}
		const title = s.title ?? s.reference
		return {
			id,
			type: 'psalm',
			role: 'all',
			title,
			// A psalm's title is already "Psalm 50"; keep the reference only when it adds a range.
			reference: s.reference !== title ? s.reference : undefined,
			rubric: rubric ?? s.rubric,
			verses: s.verses,
		}
	}
	if (!s.content.length) return null
	return {
		id,
		type: s.kind === 'litany' ? 'litany' : 'prayer',
		role: 'all',
		title: s.title ?? FALLBACK_TITLE[s.kind] ?? 'Prayer',
		...((rubric ?? s.rubric) ? { rubric: rubric ?? s.rubric } : {}),
		content: s.content,
	}
}

export function agpeyaToService(
	hour: ResolvedAgpeyaHour,
	date: string,
	copticDate: CopticDate,
): IncenseService {
	const sections: IncenseSection[] = []
	// The reader addresses sections by id, and Midnight repeats shared prayers in its
	// ending, so a repeat keeps the first id and later ones get a suffix.
	const used = new Set<string>()
	const add = (s: IncenseSection | null) => {
		if (!s) return
		let id = s.id
		for (let n = 2; used.has(id); n++) id = `${s.id}-${n}`
		used.add(id)
		sections.push({ ...s, id })
	}

	let openingSeen = false
	let psalmsSeen = false
	for (const part of hour.sections) {
		if (part.kind === 'watch') {
			const watch = part as AgWatch
			// The theme names the watch rather than being prayed, so it rides as the
			// heading's rubric; the offering and "From the Psalms…" are its body.
			add({
				id: `watch-${watch.id}`,
				type: 'prayer',
				role: 'all',
				title: watch.title,
				rubric: watch.theme,
				content: [watch.prayer, watch.psalmsIntro].filter((line): line is string => !!line),
			})
			const firstPsalm = watch.sections.find((s) => s.kind === 'psalm')
			for (const s of watch.sections) {
				const rubric = s === firstPsalm ? watch.psalmsRubric : undefined
				add(toSection(`watch-${watch.id}-${s.id}`, s, rubric))
			}
			continue
		}
		const s = part as AgLeaf
		let rubric: string | undefined
		if (s.kind === 'opening' && !openingSeen) {
			openingSeen = true
			rubric = hour.introduction
		} else if (s.kind === 'psalm' && !psalmsSeen) {
			psalmsSeen = true
			rubric = hour.psalmsIntro
		}
		add(toSection(s.id, s, rubric))
	}

	return {
		type: 'agpeya',
		name: hour.name,
		date,
		copticDate,
		sections,
	}
}
