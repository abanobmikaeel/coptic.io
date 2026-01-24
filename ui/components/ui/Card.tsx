import type { ReactNode } from 'react';

interface CardProps {
	children: ReactNode;
	className?: string;
}

export function Card({ children, className = '' }: CardProps) {
	return (
		<div className={`bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm dark:shadow-none ${className}`}>
			{children}
		</div>
	);
}

export function CardHeader({ children, className = '' }: CardProps) {
	return (
		<h3 className={`text-sm font-medium text-amber-600 dark:text-amber-500 uppercase tracking-wider mb-4 ${className}`}>
			{children}
		</h3>
	);
}

export function CardContent({ children, className = '' }: CardProps) {
	return <div className={className}>{children}</div>;
}
