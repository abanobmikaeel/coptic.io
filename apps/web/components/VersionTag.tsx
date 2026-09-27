const RELEASES_URL = 'https://github.com/abanobmikaeel/coptic.io/releases'

/** The release this build belongs to, linking to the release notes, with the short commit beside it. */
export function VersionTag() {
	const version = process.env.NEXT_PUBLIC_APP_VERSION
	if (!version) return null
	const commit = process.env.NEXT_PUBLIC_COMMIT_SHA?.slice(0, 7)

	return (
		<p className="text-gray-400 dark:text-gray-500 text-xs">
			<a href={RELEASES_URL} className="hover:underline">
				v{version}
			</a>
			{commit && <span dir="ltr"> · {commit}</span>}
		</p>
	)
}
