import type { ApiResponse } from '@coptic/client'

export type SearchResponse = ApiResponse<'/api/search'>
export type SearchResults = SearchResponse['results']
export type BibleSearchResult = SearchResults['bible'][number]
export type SynaxariumSearchResult = SearchResults['synaxarium'][number]
export type AgpeyaSearchResult = SearchResults['agpeya'][number]

// Unified result type for navigation
export type SearchResultItem =
	| (BibleSearchResult & { category: 'bible' })
	| (SynaxariumSearchResult & { category: 'synaxarium' })
	| (AgpeyaSearchResult & { category: 'agpeya' })
