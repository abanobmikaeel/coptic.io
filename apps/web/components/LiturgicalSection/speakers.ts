// Shared speaker / role label maps for all Coptic liturgical services.
// Add new languages here; components pick them up automatically.

export const ROLE_LABELS: Record<string, Record<string, string>> = {
	en: { priest: 'Priest', deacon: 'Deacon', congregation: 'People', all: '' },
	ar: { priest: 'الكاهن', deacon: 'الشماس', congregation: 'الشعب', all: '' },
	cop: { priest: 'Ⲡⲓⲟⲩⲏⲃ', deacon: 'Ⲡⲓⲇⲓⲁⲕⲱⲛ', congregation: 'Ⲡⲓⲗⲁⲟⲥ', all: '' },
}

// Canonical speaker key is always the English name ('Priest' | 'Deacon' | 'People').
// Coptic speaker labels and body text use Unicode through Noto Sans Coptic.
export const SPEAKER_LABELS: Record<string, Record<string, string>> = {
	en: { Priest: 'Priest', Deacon: 'Deacon', People: 'People' },
	ar: { Priest: 'الكاهن', Deacon: 'الشماس', People: 'الشعب' },
	cop: { Priest: 'Ⲡⲓⲟⲩⲏⲃ', Deacon: 'Ⲡⲓⲇⲓⲁⲕⲱⲛ', People: 'Ⲡⲓⲗⲁⲟⲥ' },
}

// Scripts where uppercasing labels is inappropriate.
export const PRESERVE_LABEL_CASE = new Set(['cop'])

export function getSpeakerLabel(lang: string, speaker: string): string {
	return SPEAKER_LABELS[lang]?.[speaker] ?? speaker
}

export function getRoleLabel(lang: string, role: string): string {
	return ROLE_LABELS[lang]?.[role] ?? ''
}
