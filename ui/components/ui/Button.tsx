import { ButtonHTMLAttributes, forwardRef } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: ButtonVariant;
	loading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
	primary: 'bg-amber-700 hover:bg-amber-600 disabled:bg-amber-500 text-white',
	secondary: 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700',
	danger: 'bg-red-600 hover:bg-red-500 disabled:bg-red-400 text-white',
	ghost: 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	({ className = '', variant = 'primary', loading, disabled, children, ...props }, ref) => {
		return (
			<button
				ref={ref}
				disabled={disabled || loading}
				className={`
					font-medium py-3 px-4 rounded-lg transition-colors
					disabled:cursor-not-allowed
					${variantStyles[variant]}
					${className}
				`}
				{...props}
			>
				{loading ? 'Loading...' : children}
			</button>
		);
	}
);

Button.displayName = 'Button';
