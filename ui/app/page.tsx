import Link from "next/link";
import Image from "next/image";
import { getCalendarData, getTodayCelebrations, getUpcomingCelebrations } from "@/lib/api";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import SubscribeButton from "@/components/SubscribeButton";
import DeveloperSection from "@/components/DeveloperSection";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const [calendar, celebrations, upcoming] = await Promise.all([
    getCalendarData(),
    getTodayCelebrations(),
    getUpcomingCelebrations(60),
  ]);

  const gregorianDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const copticDate = calendar?.dateString || 'Loading...';
  const todayFeast = Array.isArray(celebrations) && celebrations.length > 0
    ? celebrations[0]
    : null;

  // Filter upcoming feasts: for fasts, only show first and last day
  const upcomingFeasts = Array.isArray(upcoming)
    ? (() => {
        type EventWithDate = {
          name: string;
          type: string;
          date: string;
          id?: number;
          displayName?: string;
        };

        const allEvents: EventWithDate[] = [];
        const fastTracking = new Map<string, { firstDate: string; lastDate: string }>();

        // First pass: collect all events and track fast periods
        upcoming.forEach(day => {
          day.celebrations.forEach(cel => {
            const eventWithDate = { ...cel, date: day.date };
            allEvents.push(eventWithDate);

            // Track fast periods
            if (cel.type === 'fast') {
              const existing = fastTracking.get(cel.name);
              if (!existing) {
                fastTracking.set(cel.name, { firstDate: day.date, lastDate: day.date });
              } else {
                existing.lastDate = day.date;
              }
            }
          });
        });

        // Second pass: filter events and add labels
        const seen = new Set<string>();
        return allEvents.filter(event => {
          if (event.type !== 'fast') {
            return true; // Keep all non-fast events
          }

          // For fasts, only keep first and last day
          const fastPeriod = fastTracking.get(event.name);
          if (!fastPeriod) return true;

          const isFirstDay = event.date === fastPeriod.firstDate;
          const isLastDay = event.date === fastPeriod.lastDate;

          if (isFirstDay) {
            const key = `${event.name}-start`;
            if (seen.has(key)) return false;
            seen.add(key);
            event.displayName = `${event.name} begins`;
            return true;
          }

          if (isLastDay && fastPeriod.firstDate !== fastPeriod.lastDate) {
            const key = `${event.name}-end`;
            if (seen.has(key)) return false;
            seen.add(key);
            event.displayName = `${event.name} ends`;
            return true;
          }

          return false; // Skip middle days of fasts
        }).slice(0, 5); // Show up to 5 events
      })()
    : [];

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 container mx-auto px-4 py-12 max-w-6xl">
        {/* Hero */}
        <section className="text-center mb-12">
          <div className="relative mb-8">
            <div className="absolute left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -top-20" />
            <div className="relative pt-6">
              <Image
                src="https://upload.wikimedia.org/wikipedia/commons/7/71/Coptic_cross.svg"
                alt="Coptic Cross"
                className="mx-auto opacity-90"
                width={120}
                height={120}
                priority
              />
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 font-playfair">
            Coptic Orthodox Calendar
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Stay connected with the liturgical life of the Church
          </p>
        </section>

        {/* Today Section */}
        <section className="max-w-4xl mx-auto space-y-6 mb-12">
          <div className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 p-8 rounded-2xl border border-gray-700">
            <div className="text-center mb-6">
              <p className="text-gray-400 text-sm mb-2 uppercase tracking-wide">Today</p>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 font-playfair">
                {gregorianDate}
              </h2>
              <p className="text-lg text-blue-300">{copticDate}</p>
            </div>

            {todayFeast && (
              <Card>
                <CardHeader>Today&apos;s Feast</CardHeader>
                <CardContent>
                  <p className="text-gray-300 font-medium text-xl">{todayFeast.name}</p>
                  {todayFeast.story && (
                    <p className="text-gray-500 text-sm mt-1">{todayFeast.story}</p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Upcoming Feasts */}
          <Card>
            <CardHeader>Upcoming Feasts</CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingFeasts.length > 0 ? (
                  upcomingFeasts.map((feast, idx) => {
                    const formatType = (type: string) => {
                      const typeMap: Record<string, string> = {
                        'fast': 'Fast',
                        'feast': 'Feast',
                        'lordlyFeast': 'Lordly Feast',
                        'majorFeast': 'Major Feast',
                        'minorFeast': 'Minor Feast'
                      };
                      return typeMap[type] || type;
                    };

                    return (
                      <div
                        key={idx}
                        className={idx > 0 ? "border-t border-gray-700 pt-3 flex justify-between items-center" : "flex justify-between items-center"}
                      >
                        <div>
                          <p className="text-gray-300 font-medium">{feast.displayName || feast.name}</p>
                          <p className="text-gray-500 text-sm">{formatType(feast.type)}</p>
                        </div>
                        <p className="text-blue-400 font-semibold">
                          {new Date(feast.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-400 text-sm">No upcoming feasts</p>
                )}
              </div>
            </CardContent>
          </Card>

          <SubscribeButton />
        </section>

        {/* Developer Section */}
        <section className="max-w-4xl mx-auto mb-12">
          <DeveloperSection />
        </section>

        <section className="max-w-2xl mx-auto text-center">
          <Link href="/examples" className="text-blue-400 hover:text-blue-300 transition-colors font-medium">
            View Examples →
          </Link>
        </section>
      </main>

      <footer className="border-t border-gray-800 py-8">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>Built with dedication for the Coptic Orthodox community</p>
        </div>
      </footer>
    </div>
  );
}
