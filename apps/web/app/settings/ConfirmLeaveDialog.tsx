'use client'

interface ConfirmLeaveDialogProps {
	open: boolean
	onLeave: () => void
	onStay: () => void
}

export function ConfirmLeaveDialog({ open, onLeave, onStay }: ConfirmLeaveDialogProps) {
	if (!open) return null

	return (
		<div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
			{/* Backdrop */}
			<div
				className="absolute inset-0 bg-black/50 backdrop-blur-sm"
				onClick={onStay}
				onKeyDown={(e) => e.key === 'Escape' && onStay()}
				role="button"
				tabIndex={-1}
				aria-label="Close dialog"
			/>

			{/* Dialog */}
			<div className="relative z-10 w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 p-6">
				<h2 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
					Unsaved changes
				</h2>
				<p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
					You have unsaved changes. If you leave now they'll be lost.
				</p>
				<div className="flex gap-3 justify-end">
					<button
						type="button"
						onClick={onStay}
						className="px-4 py-2 text-sm font-medium rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
					>
						Keep editing
					</button>
					<button
						type="button"
						onClick={onLeave}
						className="px-4 py-2 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-500 transition-colors"
					>
						Discard changes
					</button>
				</div>
			</div>
		</div>
	)
}
