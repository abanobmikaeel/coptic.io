/**
 * Content translations for Bible readings
 * These are used when displaying multiple languages side-by-side,
 * separate from the UI locale translations (next-intl)
 */

import arMessages from '../messages/ar.json'
import enMessages from '../messages/en.json'
import esMessages from '../messages/es.json'

export type ContentLang = 'en' | 'ar' | 'es' | 'cop'

// Book name translations (Coptic uses English book names for references)
export const bookNames: Record<ContentLang, Record<string, string>> = {
	en: enMessages.books,
	ar: arMessages.books,
	es: esMessages.books,
	cop: enMessages.books, // Coptic uses English book names for references
}

// Service name translations (Liturgy, Vespers, Matins)
export const serviceNames: Record<ContentLang, Record<string, string>> = {
	en: enMessages.services,
	ar: arMessages.services,
	es: esMessages.services,
	cop: enMessages.services, // Coptic uses English service names
}

// Section label translations (VPsalm, LGospel, etc.)
export const sectionLabels: Record<ContentLang, Record<string, string>> = {
	en: enMessages.sections,
	ar: arMessages.sections,
	es: esMessages.sections,
	cop: enMessages.sections, // Coptic uses English section labels
}

/**
 * Get a book name in the specified language
 */
export function getBookName(englishName: string, lang: ContentLang): string {
	return bookNames[lang]?.[englishName] || englishName
}

/**
 * Get a service name in the specified language
 */
export function getServiceName(englishName: string, lang: ContentLang): string {
	return serviceNames[lang]?.[englishName] || englishName
}

/**
 * Get a section label in the specified language
 */
export function getSectionLabel(sectionKey: string, lang: ContentLang): string {
	return sectionLabels[lang]?.[sectionKey] || sectionKey
}

/**
 * Get labels for a section in all languages
 */
export function getSectionLabels(sectionKey: string): Record<ContentLang, string> {
	return {
		en: sectionLabels.en[sectionKey] || sectionKey,
		ar: sectionLabels.ar[sectionKey] || sectionKey,
		es: sectionLabels.es[sectionKey] || sectionKey,
		cop: sectionLabels.en[sectionKey] || sectionKey, // Coptic uses English labels
	}
}
