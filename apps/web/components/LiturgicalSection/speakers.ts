// Shared speaker / role label maps for all Coptic liturgical services.
// Add new languages here; components pick them up automatically.

export const ROLE_LABELS: Record<string, Record<string, string>> = {
	en: { priest: 'Priest', deacon: 'Deacon', congregation: 'People', all: '' },
	ar: { priest: 'الكاهن', deacon: 'الشماس', congregation: 'الشعب', all: '' },
	cop: { priest: 'Ⲡⲓⲟⲩⲏⲃ', deacon: 'Ⲡⲓⲇⲓⲁⲕⲱⲛ', congregation: 'Ⲡⲓⲗⲁⲟⲥ', all: '' },
}

// Canonical speaker key is always the English name ('Priest' | 'Deacon' | 'People').
// Coptic speaker labels use Unicode (for Noto Sans Coptic) so they have normal font
// metrics and align correctly with EN/AR labels. Body text stays in ASCII (CS Avva Shenouda).
export const SPEAKER_LABELS: Record<string, Record<string, string>> = {
	en: { Priest: 'Priest', Deacon: 'Deacon', People: 'People' },
	ar: { Priest: 'الكاهن', Deacon: 'الشماس', People: 'الشعب' },
	cop: { Priest: 'Ⲡⲓⲟⲩⲏⲃ', Deacon: 'Ⲡⲓⲇⲓⲁⲕⲱⲛ', People: 'Ⲡⲓⲗⲁⲟⲥ' },
}

// Languages whose font encodes text as glyphs via ASCII mapping (CS Avva Shenouda).
// For these, CSS text-transform must NOT be applied — it would mangle the ASCII
// before the font can render it as glyphs.
export const FONT_ENCODES_GLYPHS = new Set(['cop'])

export function getSpeakerLabel(lang: string, speaker: string): string {
	return SPEAKER_LABELS[lang]?.[speaker] ?? speaker
}

export function getRoleLabel(lang: string, role: string): string {
	return ROLE_LABELS[lang]?.[role] ?? ''
}
