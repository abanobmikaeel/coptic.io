export default function SubscribeButton() {
  return (
    <div className="text-center">
      <a
        href="webcal://copticio-production.up.railway.app/api/calendar/ical/subscribe"
        className="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg text-lg transition-all hover:scale-105 shadow-lg shadow-blue-500/50"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        Subscribe to Calendar
      </a>
      <p className="text-gray-400 text-sm mt-3">
        Add to Apple Calendar, Google Calendar, or Outlook
      </p>
    </div>
  );
}
