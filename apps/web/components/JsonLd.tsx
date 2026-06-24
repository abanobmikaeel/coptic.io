/**
 * Renders a JSON-LD structured-data `<script>`. Centralizes the
 * `dangerouslySetInnerHTML` + biome-ignore so pages pass a parsed object instead
 * of inlining the serialization and the lint suppression each time.
 */
export function JsonLd({ data }: { data: unknown }) {
	return (
		// biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD is serialized JSON, not markup
		<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
	)
}
