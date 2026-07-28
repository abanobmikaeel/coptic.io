/**
 * Spanish language data exports
 */

// Bible - Reina-Valera 1909 (public domain)
export * from './bible'
export * from './agpeya'
export { default as bibleData } from './bible/books.json'

export const LANGUAGE = 'es' as const
