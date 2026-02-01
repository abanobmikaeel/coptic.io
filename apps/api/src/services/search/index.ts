/**
 * Search Service Module
 *
 * Exports the active search service implementation.
 * To switch to a different backend (MeiliSearch, Elasticsearch),
 * create a new service implementing SearchService and export it here.
 */

export * from './search.interface'
export { SimpleSearchService, getSearchService } from './simple-search.service'

// Re-export the default search service for convenience
import { getSearchService } from './simple-search.service'
export const searchService = getSearchService()
