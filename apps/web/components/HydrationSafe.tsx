'use client'
import { type ReactNode, useEffect, useState } from 'react'

interface HydrationSafeProps {
	children: ReactNode
	fallback?: ReactNode
}

export function HydrationSafe({ children, fallback = null }: HydrationSafeProps) {
	const [mounted, setMounted] = useState(false)
	useEffect(() => {
		setMounted(true)
	}, [])
	if (!mounted) return <>{fallback}</>
	return <>{children}</>
}
