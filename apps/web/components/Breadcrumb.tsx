'use client'

import { ChevronRightIcon } from '@/components/ui/Icons'
import { themeClasses } from '@/lib/reading-styles'
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
	/** CSS class to apply to parent breadcrumb items (Home + items). Use to hide them responsively. */
	parentClassName?: string
}

export function Breadcrumb({ items, theme = 'light', dropdown, parentClassName }: BreadcrumbProps) {
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

	return (
		<nav aria-label="Breadcrumb">
			<ol className="flex items-center gap-1 text-sm">
				<li className={parentClassName}>
					<Link href="/" className={`${themeClasses.breadcrumbLink[theme]} transition-colors`}>
						Home
					</Link>
				</li>
				{items.map((item, idx) => (
					<li key={idx} className={`flex items-center gap-1 ${parentClassName || ''}`}>
						<ChevronRightIcon className={`w-4 h-4 ${themeClasses.breadcrumbChevron[theme]}`} />
						{item.href ? (
							<Link
								href={item.href}
								className={`${themeClasses.breadcrumbLink[theme]} transition-colors`}
							>
								{item.label}
							</Link>
						) : (
							<span className={`${themeClasses.breadcrumbLink[theme]}`}>{item.label}</span>
						)}
					</li>
				))}
				{dropdown && currentOption && (
					<li className="flex items-center gap-1">
						<ChevronRightIcon
							className={`w-4 h-4 ${themeClasses.breadcrumbChevron[theme]} ${parentClassName || ''}`}
						/>
						<div className="relative" ref={dropdownRef}>
							<button
								type="button"
								onClick={() => setIsOpen(!isOpen)}
								className={`flex items-center gap-1 ${themeClasses.breadcrumbActive[theme]} font-medium hover:text-amber-600 transition-colors`}
							>
								{currentOption.label}
								{currentOption.badge && (
									<span
										className={`ml-1 px-1.5 py-0.5 text-[10px] font-medium rounded ${themeClasses.dropdownBadge[theme]}`}
									>
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
									className={`absolute top-full left-0 mt-2 py-1 min-w-[220px] rounded-lg border shadow-lg z-50 ${themeClasses.dropdownBg[theme]}`}
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
													isActive
														? themeClasses.dropdownActiveText[theme]
														: themeClasses.dropdownText[theme]
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
														<span
															className={`font-medium ${isActive ? themeClasses.dropdownActiveText[theme] : ''}`}
														>
															{option.label}
														</span>
														{option.badge && !isActive && (
															<span
																className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${themeClasses.dropdownBadge[theme]}`}
															>
																{option.badge}
															</span>
														)}
													</div>
													{option.sublabel && (
														<span className={`text-xs ${themeClasses.dropdownMuted[theme]}`}>
															{option.sublabel}
														</span>
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
