/**
 * Copy text to the clipboard.
 *
 * Falls back to a hidden textarea and execCommand when the async clipboard API is
 * unavailable, which is the case on http origins and older mobile browsers.
 */
export const copyToClipboard = async (value: string): Promise<void> => {
	try {
		await navigator.clipboard.writeText(value)
		return
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
}
