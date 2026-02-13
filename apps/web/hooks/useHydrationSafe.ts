'use client'
import { useEffect, useState } from 'react'

export function useHydrationSafe(): boolean {
	const [isHydrated, setIsHydrated] = useState(false)
	useEffect(() => {
		setIsHydrated(true)
	}, [])
	return isHydrated
}
