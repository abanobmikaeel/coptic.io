/**
 * Arabic language data exports
 */

// Bible - Arabic Scripture text
export * from './bible'
export { default as bibleData } from './bible/books.json'

// Synaxarium - Arabic saints' lives
export { default as synaxariumCanonical } from './synaxarium/canonical.json'

// Incense - Raising of Incense (Vespers)
export * from './incense'

export const LANGUAGE = 'ar' as const

export const AVAILABLE_SOURCES = ['canonical', 'st-takla'] as const
