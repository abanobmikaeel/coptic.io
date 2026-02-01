'use client'

import { ChevronRightIcon } from '@/components/ui/Icons'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

type Theme = 'light' | 'sepia' | 'dark'

interface BreadcrumbItem {
	label: string
	href?: string
}

interface DropdownOption {
	id: string
	label: string
	sublabel?: string
	badge?: string
}

interface BreadcrumbProps {
	items: BreadcrumbItem[]
	theme?: Theme
	dropdown?: {
		current: string
		options: DropdownOption[]
		onSelect: (id: string) => void
	}
}

const themeStyles = {
	link: {
		light: 'text-gray-500 hover:text-amber-600',
		sepia: 'text-[#a08c72] hover:text-amber-700',
		dark: 'text-gray-400 hover:text-amber-500',
	},
	active: {
		light: 'text-gray-900',
		sepia: 'text-[#5c4b37]',
		dark: 'text-white',
	},
	chevron: {
		light: 'text-gray-400',
		sepia: 'text-[#c4b9a8]',
		dark: 'text-gray-600',
	},
	dropdown: {
		light: {
			bg: 'bg-white',
			border: 'border-gray-200',
			text: 'text-gray-700',
			hover: 'hover:bg-gray-50',
			activeText: 'text-amber-700',
			activeBg: 'bg-amber-50',
			muted: 'text-gray-500',
			badge: 'bg-amber-100 text-amber-700',
		},
		sepia: {
			bg: 'bg-[#f5f0e6]',
			border: 'border-[#d4c9b8]',
			text: 'text-[#5c4a32]',
			hover: 'hover:bg-[#ebe4d6]',
			activeText: 'text-amber-800',
			activeBg: 'bg-amber-100/50',
			muted: 'text-[#8b7355]',
			badge: 'bg-amber-100/70 text-amber-800',
		},
		dark: {
			bg: 'bg-gray-800',
			border: 'border-gray-700',
			text: 'text-gray-300',
			hover: 'hover:bg-gray-700',
			activeText: 'text-amber-400',
			activeBg: 'bg-amber-900/30',
			muted: 'text-gray-500',
			badge: 'bg-amber-900/40 text-amber-400',
		},
	},
}

export function Breadcrumb({ items, theme = 'light', dropdown }: BreadcrumbProps) {
	const [isOpen, setIsOpen] = useState(false)
	const dropdownRef = useRef<HTMLDivElement>(null)

	// Close dropdown when clicking outside
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsOpen(false)
			}
		}

		if (isOpen) {
			document.addEventListener('mousedown', handleClickOutside)
			return () => document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [isOpen])

	// Close on escape key
	useEffect(() => {
		function handleEscape(event: KeyboardEvent) {
			if (event.key === 'Escape') {
				setIsOpen(false)
			}
		}

		if (isOpen) {
			document.addEventListener('keydown', handleEscape)
			return () => document.removeEventListener('keydown', handleEscape)
		}
	}, [isOpen])

	const currentOption = dropdown?.options.find((o) => o.id === dropdown.current)
	const ds = themeStyles.dropdown[theme]

	return (
		<nav aria-label="Breadcrumb">
			<ol className="flex items-center gap-1 text-sm">
				<li>
					<Link href="/" className={`${themeStyles.link[theme]} transition-colors`}>
						Home
					</Link>
				</li>
				{items.map((item, idx) => (
					<li key={idx} className="flex items-center gap-1">
						<ChevronRightIcon className={`w-4 h-4 ${themeStyles.chevron[theme]}`} />
						{item.href ? (
							<Link href={item.href} className={`${themeStyles.link[theme]} transition-colors`}>
								{item.label}
							</Link>
						) : (
							<span className={`${themeStyles.link[theme]}`}>{item.label}</span>
						)}
					</li>
				))}
				{dropdown && currentOption && (
					<li className="flex items-center gap-1">
						<ChevronRightIcon className={`w-4 h-4 ${themeStyles.chevron[theme]}`} />
						<div className="relative" ref={dropdownRef}>
							<button
								type="button"
								onClick={() => setIsOpen(!isOpen)}
								className={`flex items-center gap-1 ${themeStyles.active[theme]} font-medium hover:text-amber-600 transition-colors`}
							>
								{currentOption.label}
								{currentOption.badge && (
									<span className={`ml-1 px-1.5 py-0.5 text-[10px] font-medium rounded ${ds.badge}`}>
										{currentOption.badge}
									</span>
								)}
								<svg
									width="14"
									height="14"
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
								<div
									className={`absolute top-full left-0 mt-2 py-1 min-w-[220px] rounded-lg border shadow-lg z-50 ${ds.bg} ${ds.border}`}
								>
									{dropdown.options.map((option) => {
										const isActive = dropdown.current === option.id

										return (
											<button
												key={option.id}
												type="button"
												onClick={() => {
													dropdown.onSelect(option.id)
													setIsOpen(false)
												}}
												className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-colors ${
													isActive ? `${ds.activeBg} ${ds.activeText}` : `${ds.text} ${ds.hover}`
												}`}
											>
												<span className="w-4">
													{isActive && (
														<svg
															width="16"
															height="16"
															viewBox="0 0 24 24"
															fill="none"
															stroke="currentColor"
															strokeWidth="2.5"
															aria-hidden="true"
														>
															<polyline points="20 6 9 17 4 12" />
														</svg>
													)}
												</span>
												<div className="flex-1">
													<div className="flex items-center gap-2">
														<span className={`font-medium ${isActive ? ds.activeText : ''}`}>
															{option.label}
														</span>
														{option.badge && !isActive && (
															<span className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${ds.badge}`}>
																{option.badge}
															</span>
														)}
													</div>
													{option.sublabel && (
														<span className={`text-xs ${ds.muted}`}>{option.sublabel}</span>
													)}
												</div>
											</button>
										)
									})}
								</div>
							)}
						</div>
					</li>
				)}
			</ol>
		</nav>
	)
}
