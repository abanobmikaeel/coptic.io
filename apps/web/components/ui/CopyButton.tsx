'use client'

import { CheckIcon } from '@/components/ui/Icons'
import { useEffect, useState } from 'react'

type CopyButtonProps = {
	value: string
	label: string
	copiedLabel: string
	className?: string
}

/**
 * Copies a value to the clipboard and confirms it inline.
 *
 * Falls back to selecting the text in a hidden textarea when the async clipboard API is
 * unavailable, which is the case on http origins and older mobile browsers.
 */
export default function CopyButton({ value, label, copiedLabel, className }: CopyButtonProps) {
	const [copied, setCopied] = useState(false)

	useEffect(() => {
		if (!copied) return
		const timer = setTimeout(() => setCopied(false), 2000)
		return () => clearTimeout(timer)
	}, [copied])

	const copy = async () => {
		try {
			await navigator.clipboard.writeText(value)
		} catch {
			const field = document.createElement('textarea')
			field.value = value
			field.setAttribute('readonly', '')
			field.style.position = 'fixed'
			field.style.opacity = '0'
			document.body.appendChild(field)
			field.select()
			document.execCommand('copy')
			document.body.removeChild(field)
		}
		setCopied(true)
	}

	return (
		<button type="button" onClick={copy} className={className}>
			{copied ? <CheckIcon className="w-4 h-4" /> : null}
			{copied ? copiedLabel : label}
		</button>
	)
}
