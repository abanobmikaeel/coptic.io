import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
	error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
	({ className = '', error, ...props }, ref) => {
		return (
			<input
				ref={ref}
				className={`
					w-full px-4 py-3 rounded-lg border
					${error
						? 'border-red-500 focus:ring-red-500'
						: 'border-gray-300 dark:border-gray-600 focus:ring-amber-500'
					}
					bg-white dark:bg-gray-800
					text-gray-900 dark:text-white
					placeholder-gray-500
					focus:ring-2 focus:border-transparent
					outline-none transition-all
					${className}
				`}
				{...props}
			/>
		);
	}
);

Input.displayName = 'Input';
