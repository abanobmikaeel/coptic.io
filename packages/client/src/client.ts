import type {
	CopticDate,
	DailyReadings,
	FastingInfo,
	SynaxariumEntry,
	CalendarMonth,
	LiturgicalSeason,
} from '@coptic/core'

/**
 * Configuration options for the Coptic API client
 */
export interface CopticClientConfig {
	/** Base URL of the API (default: https://api.coptic.io) */
	baseUrl?: string
	/** Default language for responses */
	language?: 'en' | 'ar' | 'cop'
	/** Request timeout in milliseconds */
	timeout?: number
}

/**
 * Options for readings requests
 */
export interface ReadingsOptions {
	/** Date to get readings for (default: today) */
	date?: Date | string
	/** Language for readings */
	language?: 'en' | 'ar' | 'cop'
}

/**
 * Options for synaxarium requests
 */
export interface SynaxariumOptions {
	/** Date to get synaxarium for */
	date?: Date | string
	/** Language for synaxarium */
	language?: 'en' | 'ar'
	/** Source to use (e.g., 'st-takla', 'suscopts') */
	source?: string
	/** Include full text */
	includeText?: boolean
}

/**
 * Options for calendar requests
 */
export interface CalendarOptions {
	/** Year to get calendar for */
	year?: number
	/** Month to get calendar for (1-12) */
	month?: number
}

/**
 * Coptic.io API Client
 *
 * A lightweight client for interacting with the Coptic.io API.
 *
 * @example
 * ```typescript
 * import { CopticClient } from '@coptic/client'
 *
 * const client = new CopticClient()
 *
 * // Get today's readings
 * const readings = await client.readings.today()
 *
 * // Get fasting info
 * const fasting = await client.fasting.today()
 *
 * // Get synaxarium
 * const synaxarium = await client.synaxarium.today()
 * ```
 */
export class CopticClient {
	private baseUrl: string
	private language: string
	private timeout: number

	/** Readings endpoint methods */
	public readings: ReadingsEndpoint
	/** Synaxarium endpoint methods */
	public synaxarium: SynaxariumEndpoint
	/** Calendar endpoint methods */
	public calendar: CalendarEndpoint
	/** Fasting endpoint methods */
	public fasting: FastingEndpoint
	/** Season endpoint methods */
	public season: SeasonEndpoint

	constructor(config: CopticClientConfig = {}) {
		this.baseUrl = config.baseUrl ?? 'https://api.coptic.io'
		this.language = config.language ?? 'en'
		this.timeout = config.timeout ?? 30000

		// Initialize endpoint classes
		this.readings = new ReadingsEndpoint(this)
		this.synaxarium = new SynaxariumEndpoint(this)
		this.calendar = new CalendarEndpoint(this)
		this.fasting = new FastingEndpoint(this)
		this.season = new SeasonEndpoint(this)
	}

	/**
	 * Make a request to the API
	 * @internal
	 */
	async fetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
		const url = new URL(`${this.baseUrl}${endpoint}`)
		for (const [key, value] of Object.entries(params)) {
			if (value !== undefined) {
				url.searchParams.set(key, value)
			}
		}

		const controller = new AbortController()
		const timeoutId = setTimeout(() => controller.abort(), this.timeout)

		try {
			const response = await fetch(url.toString(), {
				signal: controller.signal,
				headers: {
					Accept: 'application/json',
				},
			})

			if (!response.ok) {
				throw new CopticApiError(
					`API request failed: ${response.statusText}`,
					response.status
				)
			}

			return (await response.json()) as T
		} finally {
			clearTimeout(timeoutId)
		}
	}

	/**
	 * Get the default language
	 * @internal
	 */
	getDefaultLanguage(): string {
		return this.language
	}
}

/**
 * Error thrown by the Coptic API client
 */
export class CopticApiError extends Error {
	public status: number

	constructor(message: string, status: number) {
		super(message)
		this.name = 'CopticApiError'
		this.status = status
	}
}

/**
 * Readings endpoint
 */
class ReadingsEndpoint {
	constructor(private client: CopticClient) {}

	/**
	 * Get readings for today
	 */
	async today(options: Omit<ReadingsOptions, 'date'> = {}): Promise<DailyReadings> {
		return this.forDate(new Date(), options)
	}

	/**
	 * Get readings for a specific date
	 */
	async forDate(date: Date | string, options: Omit<ReadingsOptions, 'date'> = {}): Promise<DailyReadings> {
		const dateStr = date instanceof Date ? formatDate(date) : date
		const lang = options.language ?? this.client.getDefaultLanguage()
		return this.client.fetch<DailyReadings>(`/api/readings/${dateStr}`, { lang })
	}
}

/**
 * Synaxarium endpoint
 */
class SynaxariumEndpoint {
	constructor(private client: CopticClient) {}

	/**
	 * Get synaxarium for today
	 */
	async today(options: Omit<SynaxariumOptions, 'date'> = {}): Promise<SynaxariumEntry[]> {
		return this.forDate(new Date(), options)
	}

	/**
	 * Get synaxarium for a specific date
	 */
	async forDate(
		date: Date | string,
		options: Omit<SynaxariumOptions, 'date'> = {}
	): Promise<SynaxariumEntry[]> {
		const dateStr = date instanceof Date ? formatDate(date) : date
		const params: Record<string, string> = {}
		if (options.language) params.lang = options.language
		if (options.source) params.source = options.source
		if (options.includeText) params.includeText = 'true'
		return this.client.fetch<SynaxariumEntry[]>(`/api/synaxarium/${dateStr}`, params)
	}

	/**
	 * Search synaxarium entries
	 */
	async search(query: string, limit = 50): Promise<SynaxariumEntry[]> {
		return this.client.fetch<SynaxariumEntry[]>('/api/synaxarium/search', {
			q: query,
			limit: limit.toString(),
		})
	}
}

/**
 * Calendar endpoint
 */
class CalendarEndpoint {
	constructor(private client: CopticClient) {}

	/**
	 * Get Coptic date for today
	 */
	async today(): Promise<CopticDate> {
		return this.forDate(new Date())
	}

	/**
	 * Get Coptic date for a specific date
	 */
	async forDate(date: Date | string): Promise<CopticDate> {
		const dateStr = date instanceof Date ? formatDate(date) : date
		return this.client.fetch<CopticDate>(`/api/calendar/${dateStr}`)
	}

	/**
	 * Get calendar for a month
	 */
	async forMonth(year: number, month: number): Promise<CalendarMonth> {
		return this.client.fetch<CalendarMonth>(`/api/calendar/${year}/${month}`)
	}
}

/**
 * Fasting endpoint
 */
class FastingEndpoint {
	constructor(private client: CopticClient) {}

	/**
	 * Get fasting info for today
	 */
	async today(): Promise<FastingInfo> {
		return this.forDate(new Date())
	}

	/**
	 * Get fasting info for a specific date
	 */
	async forDate(date: Date | string): Promise<FastingInfo> {
		const dateStr = date instanceof Date ? formatDate(date) : date
		return this.client.fetch<FastingInfo>(`/api/fasting/${dateStr}`)
	}

	/**
	 * Get all fasting days for a year
	 */
	async forYear(year: number): Promise<FastingInfo[]> {
		return this.client.fetch<FastingInfo[]>(`/api/fasting/year/${year}`)
	}
}

/**
 * Season endpoint
 */
class SeasonEndpoint {
	constructor(private client: CopticClient) {}

	/**
	 * Get current liturgical season
	 */
	async current(): Promise<LiturgicalSeason | null> {
		return this.forDate(new Date())
	}

	/**
	 * Get liturgical season for a specific date
	 */
	async forDate(date: Date | string): Promise<LiturgicalSeason | null> {
		const dateStr = date instanceof Date ? formatDate(date) : date
		return this.client.fetch<LiturgicalSeason | null>(`/api/season/${dateStr}`)
	}

	/**
	 * Get all seasons for a year
	 */
	async forYear(year: number): Promise<LiturgicalSeason[]> {
		return this.client.fetch<LiturgicalSeason[]>(`/api/season/year/${year}`)
	}
}

/**
 * Format a date as YYYY-MM-DD
 */
function formatDate(date: Date): string {
	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const day = String(date.getDate()).padStart(2, '0')
	return `${year}-${month}-${day}`
}
