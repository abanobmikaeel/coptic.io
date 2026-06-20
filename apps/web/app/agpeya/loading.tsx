import { ServiceReaderFallback } from '@/components/LiturgicalServiceReader'

// Reuse the same skeleton the presentation reader renders, so the loading state
// matches the real Agpeya layout instead of a separate bespoke skeleton.
export default function AgpeyaLoading() {
	return <ServiceReaderFallback />
}
