'use client'

import { CheckIcon } from '@/components/ui/Icons'
import { copyToClipboard } from '@/lib/clipboard'
import { useEffect, useState } from 'react'

type CopyButtonProps = {
	value: string
	label: string
	copiedLabel: string
	className?: string
}

/**
 * Copies a value to the clipboard and confirms it inline.
 */
export default function CopyButton({ value, label, copiedLabel, className }: CopyButtonProps) {
	const [copied, setCopied] = useState(false)

	useEffect(() => {
		if (!copied) return
		const timer = setTimeout(() => setCopied(false), 2000)
		return () => clearTimeout(timer)
	}, [copied])

	const copy = async () => {
		await copyToClipboard(value)
		setCopied(true)
	}

	return (
		<button type="button" onClick={copy} className={className}>
			{copied ? <CheckIcon className="w-4 h-4" /> : null}
			{copied ? copiedLabel : label}
		</button>
	)
}
