/**
 * Coptic language data exports
 *
 * The Coptic Orthodox Church officially uses the Bohairic dialect.
 * Sahidic is used as a fallback for books not available in Bohairic.
 */

// Bible - Scripture text for verse resolution
export * from './bible'
export { default as bibleData } from './bible'

export const LANGUAGE = 'cop' as const

// Coptic doesn't have synaxarium data (that's in Arabic/English)
export const AVAILABLE_SOURCES = [] as const
