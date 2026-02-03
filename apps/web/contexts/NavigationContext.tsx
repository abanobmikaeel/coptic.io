'use client'

import { usePathname } from 'next/navigation'
import { type ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

type NavigationMode = 'browse' | 'read'

interface NavigationContextValue {
	mode: NavigationMode
	enterReadMode: () => void
	exitReadMode: () => void
	readModeTitle?: string
	setReadModeTitle: (title: string | undefined) => void
}

const NavigationContext = createContext<NavigationContextValue | null>(null)

// Pages that should automatically be in read mode
const READ_MODE_PATHS = ['/readings', '/agpeya', '/synaxarium']

export function NavigationProvider({ children }: { children: ReactNode }) {
	const pathname = usePathname()
	const [mode, setMode] = useState<NavigationMode>('browse')
	const [readModeTitle, setReadModeTitle] = useState<string | undefined>()

	// Auto-detect mode based on pathname
	useEffect(() => {
		const isReadModePath = READ_MODE_PATHS.some((path) => pathname.startsWith(path))
		setMode(isReadModePath ? 'read' : 'browse')
	}, [pathname])

	const enterReadMode = useCallback(() => {
		setMode('read')
	}, [])

	const exitReadMode = useCallback(() => {
		setMode('browse')
	}, [])

	const value = useMemo(
		() => ({
			mode,
			enterReadMode,
			exitReadMode,
			readModeTitle,
			setReadModeTitle,
		}),
		[mode, enterReadMode, exitReadMode, readModeTitle],
	)

	return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>
}

export function useNavigation() {
	const context = useContext(NavigationContext)
	if (!context) {
		throw new Error('useNavigation must be used within a NavigationProvider')
	}
	return context
}
