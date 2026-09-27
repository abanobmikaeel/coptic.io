import type {
	AgpeyaGospelSection,
	AgpeyaHourService,
	AgpeyaPart,
	AgpeyaProseSection,
	AgpeyaPsalmSection,
	AgpeyaResolvedGroup,
	AgpeyaSection,
} from '@coptic/data/en/agpeya'
import type { BibleTranslation, BibleVerse } from '../types'
import { resolveAgpeyaGospel, resolveAgpeyaPsalms } from './psalm-resolver'

// Which psalm text to serve. 'septuagint' (default) prefers the psalms embedded
// in the Agpeya data — the Septuagint-based liturgical psalter with the
// traditional Agpeya phrase divisions. Both languages come from the St-Takla
// Agpeya (English is the standard church translation, not a raw Brenton
// edition); see packages/data/scripts/embed-en-psalms.ts for the English import pipeline.
// 'bible' always resolves the hour's psalm references against the Bible
// translation instead (Masoretic-style versification), for readers who want
// the wording of their own Bible.
export type PsalmSource = 'septuagint' | 'bible'

export type ServedProseSection = Pick<
	AgpeyaProseSection,
	'id' | 'kind' | 'title' | 'rubric' | 'inline' | 'content'
>

export interface ServedScriptureSection {
	id: string
	kind: 'psalm' | 'intro-psalm' | 'gospel'
	title?: string
	reference: string
	rubric?: string
	verses: BibleVerse[]
}

export type ServedLeafSection = ServedProseSection | ServedScriptureSection

/** A Midnight watch: a named run of sections. */
export interface ServedWatch {
	id: string
	kind: 'watch'
	title: string
	theme?: string
	psalmsIntro?: string
	sections: ServedLeafSection[]
}

export type ServedSection = ServedLeafSection | ServedWatch

const optional = <K extends string, V>(key: K, value: V | undefined) =>
	(value === undefined || value === '' ? {} : { [key]: value }) as Partial<Record<K, V>>

const prose = (s: AgpeyaProseSection): ServedProseSection => ({
	id: s.id,
	kind: s.kind,
	...optional('title', s.title),
	...optional('rubric', s.rubric),
	...(s.inline ? { inline: true } : {}),
	content: s.content,
})

function psalm(
	s: AgpeyaPsalmSection,
	translation: BibleTranslation,
	source: PsalmSource,
): ServedScriptureSection | null {
	const title = s.title ?? `Psalm ${s.psalmNumber}`
	// Psalm 50 as the hour's introductory psalm has always been read from the Bible
	// translation; the embedded Septuagint psalter serves the hour's own psalms.
	if (s.kind === 'psalm' && source === 'septuagint' && s.verses?.length) {
		return {
			id: s.id,
			kind: s.kind,
			title,
			reference: title,
			...optional('rubric', s.rubric),
			verses: s.verses,
		}
	}
	const [resolved] = resolveAgpeyaPsalms([{ ...s, title }], translation)
	if (!resolved?.verses.length) return null
	return {
		id: s.id,
		kind: s.kind,
		title: resolved.title,
		reference: resolved.reference,
		...optional('rubric', s.rubric),
		verses: resolved.verses,
	}
}

function gospel(
	s: AgpeyaGospelSection,
	translation: BibleTranslation,
): ServedScriptureSection | null {
	const resolved = resolveAgpeyaGospel(s, translation)
	if (!resolved) return null
	return {
		id: s.id,
		kind: 'gospel',
		...optional('title', s.title),
		reference: resolved.reference,
		...optional('rubric', resolved.rubric),
		verses: resolved.verses,
	}
}

function leaf(
	s: AgpeyaSection,
	translation: BibleTranslation,
	source: PsalmSource,
): ServedLeafSection | null {
	if ('content' in s) return prose(s)
	return s.kind === 'gospel' ? gospel(s, translation) : psalm(s, translation, source)
}

/**
 * The hour in prayed order, scripture resolved in the requested translation. A
 * psalm or gospel this translation has no text for is left out of that language.
 */
export function toServedSections(
	hour: AgpeyaHourService,
	translation: BibleTranslation,
	source: PsalmSource,
): ServedSection[] {
	const leaves = (sections: AgpeyaSection[]) =>
		sections.flatMap((s) => {
			const served = leaf(s, translation, source)
			return served ? [served] : []
		})
	const isGroup = (part: AgpeyaPart): part is AgpeyaResolvedGroup => 'group' in part
	return hour.parts.flatMap((part): ServedSection[] => {
		if (!isGroup(part)) return leaves([part])
		return [
			{
				id: part.group,
				kind: 'watch',
				title: part.name,
				...optional('theme', part.theme),
				...optional('psalmsIntro', part.psalmsIntro),
				sections: leaves(part.sections),
			},
		]
	})
}
