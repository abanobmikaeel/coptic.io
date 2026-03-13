'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

interface NavItem {
	label: string
	description: string
	href: string
}

interface NavDropdownProps {
	label: string
	items: NavItem[]
	id?: string
	onOpen?: (id: string) => void
	forceClose?: boolean
}

export function NavDropdown({ label, items, id, onOpen, forceClose }: NavDropdownProps) {
	const [isOpen, setIsOpen] = useState(false)
	const dropdownRef = useRef<HTMLDivElement>(null)
	const timeoutRef = useRef<NodeJS.Timeout | null>(null)
	const pathname = usePathname()

	// Check if any item is active
	const isActive = items.some((item) => pathname.startsWith(item.href))

	// Close dropdown when clicking outside
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsOpen(false)
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [])

	// Close dropdown on route change
	// biome-ignore lint/correctness/useExhaustiveDependencies: we intentionally want to run this effect when pathname changes
	useEffect(() => {
		setIsOpen(false)
	}, [pathname])

	// Force close when another dropdown opens
	useEffect(() => {
		if (forceClose) {
			setIsOpen(false)
		}
	}, [forceClose])

	const handleMouseEnter = () => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current)
			timeoutRef.current = null
		}
		setIsOpen(true)
		if (id) onOpen?.(id)
	}

	const handleMouseLeave = () => {
		timeoutRef.current = setTimeout(() => {
			setIsOpen(false)
		}, 150)
	}

	return (
		<div
			ref={dropdownRef}
			className="relative"
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
		>
			<button
				type="button"
				onClick={() => {
					const next = !isOpen
					setIsOpen(next)
					if (next && id) onOpen?.(id)
				}}
				className={`flex items-center gap-1 text-[13px] transition-colors ${
					isActive
						? 'text-amber-600 dark:text-amber-500'
						: 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
				}`}
				aria-expanded={isOpen}
				aria-haspopup="true"
			>
				{label}
				<svg
					width="12"
					height="12"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
					aria-hidden="true"
				>
					<path d="m6 9 6 6 6-6" />
				</svg>
			</button>

			{isOpen && (
				<div className="absolute top-full left-0 mt-2 w-56 py-2 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 z-50">
					{items.map((item) => {
						const isItemActive = pathname.startsWith(item.href)
						return (
							<Link
								key={item.href}
								href={item.href}
								className={`block px-4 py-2.5 transition-colors ${
									isItemActive
										? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'
										: 'hover:bg-gray-50 dark:hover:bg-gray-800'
								}`}
							>
								<span
									className={`block text-sm font-medium ${
										isItemActive
											? 'text-amber-700 dark:text-amber-400'
											: 'text-gray-900 dark:text-white'
									}`}
								>
									{item.label}
								</span>
								<span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5">
									{item.description}
								</span>
							</Link>
						)
					})}
				</div>
			)}
		</div>
	)
}
