import { CalendarView } from '@/components/calendar'
import { Suspense } from 'react'
import CalendarLoading from './loading'

// CalendarView reads its month from the URL, which needs a Suspense boundary on a static page
export default function CalendarPage() {
	return (
		<Suspense fallback={<CalendarLoading />}>
			<CalendarView />
		</Suspense>
	)
}
