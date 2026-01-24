'use client';

import { useState, useEffect } from 'react';

const API_BASE = 'https://copticio-production.up.railway.app/api';

interface FastingDay {
	date: string;
	copticDate: {
		dateString: string;
		day: number;
		month: number;
		year: number;
		monthString: string;
	};
	fastType: string;
	description: string;
}

const MONTHS = [
	'January', 'February', 'March', 'April', 'May', 'June',
	'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const FAST_COLORS: Record<string, { bg: string; text: string; darkBg: string; darkText: string }> = {
	'Advent Fast': { bg: 'bg-purple-100', text: 'text-purple-700', darkBg: 'dark:bg-purple-900/30', darkText: 'dark:text-purple-400' },
	'Great Lent': { bg: 'bg-violet-100', text: 'text-violet-700', darkBg: 'dark:bg-violet-900/30', darkText: 'dark:text-violet-400' },
	"Apostles' Fast": { bg: 'bg-blue-100', text: 'text-blue-700', darkBg: 'dark:bg-blue-900/30', darkText: 'dark:text-blue-400' },
	'Fast of Nineveh': { bg: 'bg-teal-100', text: 'text-teal-700', darkBg: 'dark:bg-teal-900/30', darkText: 'dark:text-teal-400' },
	'default': { bg: 'bg-amber-100', text: 'text-amber-700', darkBg: 'dark:bg-amber-900/30', darkText: 'dark:text-amber-400' },
};

export default function CalendarPage() {
	const today = new Date();
	const [year, setYear] = useState(today.getFullYear());
	const [month, setMonth] = useState(today.getMonth());
	const [fastingDays, setFastingDays] = useState<Map<string, FastingDay>>(new Map());
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchFasting() {
			setLoading(true);
			try {
				const res = await fetch(`${API_BASE}/fasting/calendar/${year}`);
				const data: FastingDay[] = await res.json();
				const map = new Map<string, FastingDay>();
				data.forEach(day => map.set(day.date, day));
				setFastingDays(map);
			} catch (err) {
				console.error('Failed to fetch fasting data:', err);
			}
			setLoading(false);
		}
		fetchFasting();
	}, [year]);

	const getDaysInMonth = (year: number, month: number) => {
		return new Date(year, month + 1, 0).getDate();
	};

	const getFirstDayOfMonth = (year: number, month: number) => {
		return new Date(year, month, 1).getDay();
	};

	const formatDateKey = (year: number, month: number, day: number) => {
		return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
	};

	const prevMonth = () => {
		if (month === 0) {
			setMonth(11);
			setYear(year - 1);
		} else {
			setMonth(month - 1);
		}
	};

	const nextMonth = () => {
		if (month === 11) {
			setMonth(0);
			setYear(year + 1);
		} else {
			setMonth(month + 1);
		}
	};

	const daysInMonth = getDaysInMonth(year, month);
	const firstDay = getFirstDayOfMonth(year, month);
	const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
	const blanks = Array.from({ length: firstDay }, (_, i) => i);

	const isToday = (day: number) => {
		return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
	};

	// Get legend items from current visible fasts
	const visibleFasts = new Set<string>();
	days.forEach(day => {
		const dateKey = formatDateKey(year, month, day);
		const fasting = fastingDays.get(dateKey);
		if (fasting) visibleFasts.add(fasting.description);
	});

	return (
		<main className="min-h-screen relative">
			{/* Background */}
			<div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none">
				<div className="absolute top-20 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-amber-500/[0.03] dark:bg-amber-500/[0.05] rounded-full blur-[100px]" />
			</div>

			<section className="relative pt-20 pb-8 px-6">
				<div className="max-w-2xl mx-auto text-center">
					<h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Fasting Calendar</h1>
					<p className="text-gray-600 dark:text-gray-400">
						View fasting periods throughout the year
					</p>
				</div>
			</section>

			<section className="relative px-6 pb-16">
				<div className="max-w-2xl mx-auto">
					{/* Month navigation */}
					<div className="flex items-center justify-between mb-6">
						<button
							onClick={prevMonth}
							className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
						>
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
							</svg>
						</button>
						<h2 className="text-xl font-semibold text-gray-900 dark:text-white">
							{MONTHS[month]} {year}
						</h2>
						<button
							onClick={nextMonth}
							className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
						>
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
							</svg>
						</button>
					</div>

					{/* Calendar grid */}
					<div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 mb-6 shadow-sm dark:shadow-none">
						{/* Day headers */}
						<div className="grid grid-cols-7 mb-2">
							{DAYS.map(day => (
								<div key={day} className="text-center text-xs font-medium text-gray-500 dark:text-gray-500 py-2">
									{day}
								</div>
							))}
						</div>

						{/* Days */}
						{loading ? (
							<div className="h-64 flex items-center justify-center">
								<p className="text-gray-500">Loading...</p>
							</div>
						) : (
							<div className="grid grid-cols-7 gap-1">
								{blanks.map(i => (
									<div key={`blank-${i}`} className="aspect-square" />
								))}
								{days.map(day => {
									const dateKey = formatDateKey(year, month, day);
									const fasting = fastingDays.get(dateKey);
									const colors = fasting
										? FAST_COLORS[fasting.description] || FAST_COLORS.default
										: null;

									return (
										<div
											key={day}
											className={`
												aspect-square flex flex-col items-center justify-center rounded-lg text-sm relative
												${isToday(day) ? 'ring-2 ring-amber-500' : ''}
												${fasting ? `${colors?.bg} ${colors?.darkBg}` : 'hover:bg-gray-100 dark:hover:bg-gray-800/50'}
											`}
											title={fasting ? `${fasting.description} - ${fasting.copticDate.dateString}` : undefined}
										>
											<span className={`
												font-medium
												${isToday(day) ? 'text-amber-600 dark:text-amber-500' : ''}
												${fasting ? `${colors?.text} ${colors?.darkText}` : 'text-gray-700 dark:text-gray-300'}
											`}>
												{day}
											</span>
										</div>
									);
								})}
							</div>
						)}
					</div>

					{/* Legend */}
					{visibleFasts.size > 0 && (
						<div className="flex flex-wrap gap-3 justify-center">
							{Array.from(visibleFasts).map(fast => {
								const colors = FAST_COLORS[fast] || FAST_COLORS.default;
								return (
									<div key={fast} className="flex items-center gap-2">
										<div className={`w-3 h-3 rounded ${colors.bg} ${colors.darkBg}`} />
										<span className="text-xs text-gray-600 dark:text-gray-400">{fast}</span>
									</div>
								);
							})}
						</div>
					)}
				</div>
			</section>
		</main>
	);
}
