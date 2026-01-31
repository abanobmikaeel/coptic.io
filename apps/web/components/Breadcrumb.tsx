import { ChevronRightIcon } from '@/components/ui/Icons'
import Link from 'next/link'

interface BreadcrumbItem {
	label: string
	href?: string
}

interface BreadcrumbProps {
	items: BreadcrumbItem[]
}

export function Breadcrumb({ items }: BreadcrumbProps) {
	return (
		<nav aria-label="Breadcrumb" className="mb-6">
			<ol className="flex items-center gap-1 text-sm">
				<li>
					<Link
						href="/"
						className="text-gray-500 hover:text-amber-600 dark:hover:text-amber-500 transition-colors"
					>
						Home
					</Link>
				</li>
				{items.map((item, idx) => (
					<li key={idx} className="flex items-center gap-1">
						<ChevronRightIcon className="w-4 h-4 text-gray-400" />
						{item.href ? (
							<Link
								href={item.href}
								className="text-gray-500 hover:text-amber-600 dark:hover:text-amber-500 transition-colors"
							>
								{item.label}
							</Link>
						) : (
							<span className="text-gray-900 dark:text-white font-medium">{item.label}</span>
						)}
					</li>
				))}
			</ol>
		</nav>
	)
}
