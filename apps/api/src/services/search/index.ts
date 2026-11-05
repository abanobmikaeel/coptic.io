/**
 * Search Service Module
 *
 * Exports the active search service implementation.
 * To switch to a different backend (MeiliSearch, Elasticsearch),
 * create a new service implementing SearchService and export it here.
 */

export * from './search.interface'
export { SimpleSearchService, getSearchService } from './simple-search.service'

import type { SearchOptions, SearchResponse } from './search.interface'
import { getSearchService } from './simple-search.service'

// Re-export the default search service for convenience
export const searchService = getSearchService()

export const SEARCH_CATEGORIES = ['bible', 'synaxarium', 'agpeya'] as const
export type SearchCategory = (typeof SEARCH_CATEGORIES)[number]

/** The categories a comma-separated input names; unknown names are ignored. */
export const parseSearchCategories = (input?: string): SearchCategory[] | undefined =>
	input
		?.split(',')
		.map((category) => category.trim())
		.filter((category): category is SearchCategory =>
			(SEARCH_CATEGORIES as readonly string[]).includes(category),
		)

// Initialize the search service on first use, deduplicated across concurrent
// callers. A failure clears the cached promise: initialization fetches the Bible from
// R2, so a transient error must not leave the isolate unable to search until it is
// recycled.
let initPromise: Promise<void> | null = null
const ensureInitialized = (): Promise<void> => {
	initPromise ??= searchService.initialize().catch((error) => {
		initPromise = null
		throw error
	})
	return initPromise
}

/** Search every category, initializing the index on first use. */
export const search = async (options: SearchOptions): Promise<SearchResponse> => {
	await ensureInitialized()
	return searchService.search(options)
}
