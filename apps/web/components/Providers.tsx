'use client'

import { CommandPaletteProvider } from '@/components/CommandPalette'
import { NavigationProvider } from '@/contexts/NavigationContext'
import { ReadingSettingsProvider } from '@/contexts/ReadingSettingsContext'
import type { ReactNode } from 'react'
import { Suspense } from 'react'

interface ProvidersProps {
	children: ReactNode
}

/**
 * Client-side providers wrapper.
 * ReadingSettingsProvider needs Suspense because it uses useSearchParams.
 */
export function Providers({ children }: ProvidersProps) {
	return (
		<CommandPaletteProvider>
			<NavigationProvider>
				<Suspense fallback={null}>
					<ReadingSettingsProvider>{children}</ReadingSettingsProvider>
				</Suspense>
			</NavigationProvider>
		</CommandPaletteProvider>
	)
}
