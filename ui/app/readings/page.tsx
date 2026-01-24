import { Card, CardHeader, CardContent } from '@/components/ui/Card';

const API_BASE = 'https://copticio-production.up.railway.app/api';

interface Verse {
	text: string;
	num: number;
}

interface Chapter {
	chapterNum: number;
	verses: Verse[];
}

interface Reading {
	bookName: string;
	chapters: Chapter[];
}

interface SynaxariumEntry {
	name: string;
	url: string;
}

interface ReadingsData {
	VPsalm?: Reading[];
	VGospel?: Reading[];
	MPsalm?: Reading[];
	MGospel?: Reading[];
	Pauline?: Reading[];
	Catholic?: Reading[];
	Acts?: Reading[];
	LPsalm?: Reading[];
	LGospel?: Reading[];
	Synxarium?: SynaxariumEntry[];
	fullDate?: {
		dateString: string;
		day: number;
		month: number;
		year: number;
		monthString: string;
	};
}

const sectionLabels: Record<string, { title: string; subtitle: string }> = {
	VPsalm: { title: 'Vespers Psalm', subtitle: 'Evening Prayer' },
	VGospel: { title: 'Vespers Gospel', subtitle: 'Evening Prayer' },
	MPsalm: { title: 'Matins Psalm', subtitle: 'Morning Prayer' },
	MGospel: { title: 'Matins Gospel', subtitle: 'Morning Prayer' },
	Pauline: { title: 'Pauline Epistle', subtitle: 'Liturgy of the Word' },
	Catholic: { title: 'Catholic Epistle', subtitle: 'Liturgy of the Word' },
	Acts: { title: 'Acts of the Apostles', subtitle: 'Liturgy of the Word' },
	LPsalm: { title: 'Liturgy Psalm', subtitle: 'Liturgy of the Word' },
	LGospel: { title: 'Liturgy Gospel', subtitle: 'Liturgy of the Word' },
};

async function getReadings(): Promise<ReadingsData | null> {
	try {
		const res = await fetch(`${API_BASE}/readings?detailed=true`, {
			cache: 'no-store',
		});
		if (!res.ok) return null;
		return res.json();
	} catch {
		return null;
	}
}

function ReadingSection({ readings, label }: { readings: Reading[]; label: { title: string; subtitle: string } }) {
	return (
		<div className="mb-8">
			<div className="mb-4">
				<h3 className="text-lg font-semibold text-gray-900 dark:text-white">{label.title}</h3>
				<p className="text-sm text-gray-500 dark:text-gray-500">{label.subtitle}</p>
			</div>
			{readings.map((reading, idx) => (
				<div key={idx} className="mb-4">
					{reading.chapters.map((chapter, cidx) => (
						<div key={cidx}>
							<p className="text-sm font-medium text-amber-600 dark:text-amber-500 mb-3">
								{reading.bookName} {chapter.chapterNum}:{chapter.verses[0]?.num}
								{chapter.verses.length > 1 && `-${chapter.verses[chapter.verses.length - 1]?.num}`}
							</p>
							<div className="space-y-3">
								{chapter.verses.map((verse) => (
									<p key={verse.num} className="text-gray-700 dark:text-gray-300 leading-relaxed">
										<span className="text-gray-400 dark:text-gray-600 text-sm mr-2">{verse.num}</span>
										{verse.text}
									</p>
								))}
							</div>
						</div>
					))}
				</div>
			))}
		</div>
	);
}

export default async function ReadingsPage() {
	const readings = await getReadings();

	const gregorianDate = new Date().toLocaleDateString('en-US', {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	});

	const sections = ['Pauline', 'Catholic', 'Acts', 'LPsalm', 'LGospel'] as const;
	const vespersMatins = ['VPsalm', 'VGospel', 'MPsalm', 'MGospel'] as const;

	return (
		<main className="min-h-screen relative">
			{/* Background */}
			<div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none">
				<div className="absolute top-20 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-amber-500/[0.03] dark:bg-amber-500/[0.05] rounded-full blur-[100px]" />
			</div>

			<section className="relative pt-20 pb-8 px-6">
				<div className="max-w-2xl mx-auto text-center">
					<h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Daily Readings</h1>
					<p className="text-gray-600 dark:text-gray-400 mb-1">{gregorianDate}</p>
					{readings?.fullDate && (
						<p className="text-amber-600 dark:text-amber-500 font-medium">{readings.fullDate.dateString}</p>
					)}
				</div>
			</section>

			{readings ? (
				<section className="relative px-6 pb-16">
					<div className="max-w-2xl mx-auto">
						{/* Synaxarium */}
						{readings.Synxarium && readings.Synxarium.length > 0 && (
							<Card className="mb-6">
								<CardHeader>Synaxarium</CardHeader>
								<CardContent>
									<ul className="space-y-2">
										{readings.Synxarium.map((entry, idx) => (
											<li key={idx}>
												<a
													href={entry.url}
													target="_blank"
													rel="noopener noreferrer"
													className="text-gray-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-500 transition-colors"
												>
													{entry.name}
												</a>
											</li>
										))}
									</ul>
								</CardContent>
							</Card>
						)}

						{/* Liturgy Readings */}
						<Card className="mb-6">
							<CardHeader>Liturgy Readings</CardHeader>
							<CardContent>
								{sections.map((key) => {
									const data = readings[key];
									if (!data || data.length === 0) return null;
									return (
										<ReadingSection
											key={key}
											readings={data}
											label={sectionLabels[key]}
										/>
									);
								})}
							</CardContent>
						</Card>

						{/* Vespers & Matins */}
						<Card>
							<CardHeader>Vespers & Matins</CardHeader>
							<CardContent>
								{vespersMatins.map((key) => {
									const data = readings[key];
									if (!data || data.length === 0) return null;
									return (
										<ReadingSection
											key={key}
											readings={data}
											label={sectionLabels[key]}
										/>
									);
								})}
							</CardContent>
						</Card>
					</div>
				</section>
			) : (
				<section className="relative px-6 pb-16">
					<div className="max-w-2xl mx-auto text-center">
						<p className="text-gray-500">Unable to load readings. Please try again later.</p>
					</div>
				</section>
			)}
		</main>
	);
}
