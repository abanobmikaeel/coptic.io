/**
 * Search Service Interface
 *
 * Abstract interface for search functionality. This allows swapping
 * the implementation between different search backends:
 * - SimpleSearchService: In-memory search (current)
 * - MeiliSearchService: MeiliSearch integration (future)
 * - ElasticsearchService: Elasticsearch integration (future)
 */

// Result types for each content category
export interface BibleSearchResult {
	type: 'verse' | 'reference'
	book: string
	chapter: number
	verse?: number
	text: string
	url: string
	score?: number
}

export interface SynaxariumSearchResult {
	type: 'saint' | 'feast'
	name: string
	date: string
	copticDate: string
	summary?: string
	url: string
	score?: number
}

export interface AgpeyaSearchResult {
	type: 'hour' | 'prayer'
	id: string
	name: string
	englishName: string
	traditionalTime?: string
	url: string
	score?: number
}

// Unified search response
export interface SearchResults {
	bible: BibleSearchResult[]
	synaxarium: SynaxariumSearchResult[]
	agpeya: AgpeyaSearchResult[]
}

export interface SearchResponse {
	results: SearchResults
	query: string
	totalCount: number
}

// Search options
export interface SearchOptions {
	query: string
	limit?: number
	categories?: ('bible' | 'synaxarium' | 'agpeya')[]
}

/**
 * Abstract search service interface
 *
 * Implement this interface to add a new search backend.
 * The service should handle indexing and querying for all content types.
 */
export interface SearchService {
	/**
	 * Search across all content types
	 */
	search(options: SearchOptions): Promise<SearchResponse>

	/**
	 * Search only Bible content
	 */
	searchBible(query: string, limit?: number): Promise<BibleSearchResult[]>

	/**
	 * Search only Synaxarium content
	 */
	searchSynaxarium(query: string, limit?: number): Promise<SynaxariumSearchResult[]>

	/**
	 * Search only Agpeya content
	 */
	searchAgpeya(query: string, limit?: number): Promise<AgpeyaSearchResult[]>

	/**
	 * Initialize the search service (build indexes, connect to backend, etc.)
	 * Called once at startup
	 */
	initialize(): Promise<void>

	/**
	 * Check if the service is ready to handle queries
	 */
	isReady(): boolean

	/**
	 * Get the name of the search backend (for logging/debugging)
	 */
	getBackendName(): string
}

/**
 * Factory type for creating search services
 * Useful for dependency injection and testing
 */
export type SearchServiceFactory = () => SearchService
