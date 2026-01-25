'use client'

import { useCallback, useState } from 'react'

interface UseFetchState<T> {
	data: T | null
	loading: boolean
	error: string | null
}

interface UseFetchReturn<T> extends UseFetchState<T> {
	execute: (url: string, options?: RequestInit) => Promise<T | null>
	reset: () => void
}

export function useFetch<T = unknown>(): UseFetchReturn<T> {
	const [state, setState] = useState<UseFetchState<T>>({
		data: null,
		loading: false,
		error: null,
	})

	const execute = useCallback(async (url: string, options?: RequestInit): Promise<T | null> => {
		setState((prev) => ({ ...prev, loading: true, error: null }))

		try {
			const res = await fetch(url, options)
			const data = await res.json()

			if (!res.ok) {
				const errorMessage = data.error || 'Something went wrong'
				setState({ data: null, loading: false, error: errorMessage })
				return null
			}

			setState({ data, loading: false, error: null })
			return data
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Network error'
			setState({ data: null, loading: false, error: errorMessage })
			return null
		}
	}, [])

	const reset = useCallback(() => {
		setState({ data: null, loading: false, error: null })
	}, [])

	return { ...state, execute, reset }
}
