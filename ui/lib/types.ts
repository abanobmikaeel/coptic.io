export interface CopticDate {
  dateString: string;
  day: number;
  month: number;
  year: number;
  monthString: string;
}

export interface CalendarData {
  dateString: string;
  day: number;
  month: number;
  year: number;
  monthString: string;
  copticMonthName?: string;
  copticDay?: number;
  copticYear?: number;
}

export interface SeasonData {
  season?: string;
  description?: string;
  isFasting?: boolean;
}

export interface Celebration {
  id: number;
  name: string;
  type: string;
  story?: string;
}

export interface UpcomingCelebration {
  date: string;
  copticDate: CopticDate;
  celebrations: Celebration[];
}
