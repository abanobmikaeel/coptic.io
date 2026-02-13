interface InlinePrayerProps {
	content: string[]
	textStyles: string
	isRtl: boolean
}

export function InlinePrayer({ content, textStyles, isRtl }: InlinePrayerProps) {
	return (
		<div className={`space-y-4 ${textStyles}`} dir={isRtl ? 'rtl' : 'ltr'}>
			{content.map((paragraph, idx) => (
				<p key={idx}>{paragraph}</p>
			))}
		</div>
	)
}
