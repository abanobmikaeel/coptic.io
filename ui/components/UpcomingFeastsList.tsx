'use client';

import { useState } from 'react';

interface Feast {
  name: string;
  type: string;
  date: string;
  displayName?: string;
}

interface UpcomingFeastsListProps {
  feasts: Feast[];
}

export default function UpcomingFeastsList({ feasts }: UpcomingFeastsListProps) {
  const [visibleCount, setVisibleCount] = useState(7);

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

  const visibleFeasts = feasts.slice(0, visibleCount);
  const hasMore = visibleCount < feasts.length;

  return (
    <>
      {visibleFeasts.length > 0 ? (
        <>
          <div
            className="max-h-[400px] overflow-y-auto space-y-3 pr-2"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#374151 #1f2937'
            }}
          >
            {visibleFeasts.map((feast, idx) => (
              <div
                key={idx}
                className={idx > 0 ? "border-t border-gray-700/50 pt-4 pb-3 flex justify-between items-start gap-4" : "pb-3 flex justify-between items-start gap-4"}
              >
                <div className="flex-1">
                  <p className="text-gray-200 font-medium mb-1">{feast.displayName || feast.name}</p>
                  <p className="text-gray-500 text-sm">{formatType(feast.type)}</p>
                </div>
                <p className="text-blue-400 font-semibold whitespace-nowrap text-sm">
                  {new Date(feast.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}
                </p>
              </div>
            ))}
          </div>
          {hasMore && (
            <button
              onClick={() => setVisibleCount(prev => prev + 7)}
              className="w-full mt-4 py-2 px-4 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-colors text-sm font-medium"
            >
              Show More
            </button>
          )}
        </>
      ) : (
        <p className="text-gray-400 text-sm">No upcoming feasts</p>
      )}
    </>
  );
}
