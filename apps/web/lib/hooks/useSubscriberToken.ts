'use client'

import { useCallback, useSyncExternalStore } from 'react'

const TOKEN_KEY = 'subscriber_token'

interface UseSubscriberTokenReturn {
	token: string | null
	setToken: (token: string) => void
	clearToken: () => void
	isLoading: boolean
}

// Storage event listeners for cross-tab sync
const listeners = new Set<() => void>()

function subscribe(callback: () => void) {
	listeners.add(callback)
	return () => listeners.delete(callback)
}

function getSnapshot(): string | null {
	return localStorage.getItem(TOKEN_KEY)
}

function getServerSnapshot(): string | null {
	return null
}

function notifyListeners() {
	listeners.forEach((listener) => listener())
}

export function useSubscriberToken(): UseSubscriberTokenReturn {
	const token = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

	const setToken = useCallback((newToken: string) => {
		localStorage.setItem(TOKEN_KEY, newToken)
		notifyListeners()
	}, [])

	const clearToken = useCallback(() => {
		localStorage.removeItem(TOKEN_KEY)
		notifyListeners()
	}, [])

	// isLoading is false since useSyncExternalStore handles hydration
	return { token, setToken, clearToken, isLoading: false }
}
