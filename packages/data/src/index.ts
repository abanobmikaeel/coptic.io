/**
 * @coptic/data - Offline data bundle for Coptic Orthodox Church
 *
 * This package provides:
 * - Bible texts in multiple languages
 * - Synaxarium (lives of saints) in multiple languages
 * - Daily readings according to the Katameros
 * - Non-moveable celebrations and feasts
 *
 * Data is organized by language with source tracking for transparency.
 *
 * @packageDocumentation
 */

// Re-export types
export type { SynaxariumEntry } from '@coptic/core'

/**
 * Supported languages
 */
export type SupportedLanguage = 'en' | 'ar' | 'cop'

/**
 * Data sources for synaxarium
 */
export type SynaxariumSource = 'st-takla' | 'suscopts' | 'canonical'

/**
 * Get available languages
 */
export const getAvailableLanguages = (): SupportedLanguage[] => {
	return ['en', 'ar', 'cop']
}

/**
 * Get available synaxarium sources for a language
 */
export const getAvailableSources = (language: SupportedLanguage): SynaxariumSource[] => {
	switch (language) {
		case 'en':
			return ['canonical', 'st-takla', 'suscopts']
		case 'ar':
			return ['canonical', 'st-takla']
		case 'cop':
			return []
		default:
			return []
	}
}

/**
 * Data loading utilities
 */
export * from './loader'
