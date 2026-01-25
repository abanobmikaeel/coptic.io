export const GREGORIAN_MONTHS = [
	'January', 'February', 'March', 'April', 'May', 'June',
	'July', 'August', 'September', 'October', 'November', 'December'
] as const;

export const COPTIC_MONTHS = [
	'Tout', 'Baba', 'Hatour', 'Kiahk', 'Toba', 'Amshir',
	'Baramhat', 'Baramouda', 'Bashans', 'Paona', 'Epep', 'Mesra', 'Nasie'
] as const;

export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

export const FAST_COLORS = {
	'Advent Fast': {
		bg: 'bg-purple-100',
		text: 'text-purple-700',
		darkBg: 'dark:bg-purple-900/30',
		darkText: 'dark:text-purple-400',
		hoverBg: 'hover:bg-purple-200',
		darkHoverBg: 'dark:hover:bg-purple-900/50',
		icon: 'A'
	},
	'Great Lent': {
		bg: 'bg-violet-100',
		text: 'text-violet-700',
		darkBg: 'dark:bg-violet-900/30',
		darkText: 'dark:text-violet-400',
		hoverBg: 'hover:bg-violet-200',
		darkHoverBg: 'dark:hover:bg-violet-900/50',
		icon: 'L'
	},
	"Apostles' Fast": {
		bg: 'bg-blue-100',
		text: 'text-blue-700',
		darkBg: 'dark:bg-blue-900/30',
		darkText: 'dark:text-blue-400',
		hoverBg: 'hover:bg-blue-200',
		darkHoverBg: 'dark:hover:bg-blue-900/50',
		icon: 'P'
	},
	'Fast of Nineveh': {
		bg: 'bg-teal-100',
		text: 'text-teal-700',
		darkBg: 'dark:bg-teal-900/30',
		darkText: 'dark:text-teal-400',
		hoverBg: 'hover:bg-teal-200',
		darkHoverBg: 'dark:hover:bg-teal-900/50',
		icon: 'N'
	},
	'default': {
		bg: 'bg-amber-100',
		text: 'text-amber-700',
		darkBg: 'dark:bg-amber-900/30',
		darkText: 'dark:text-amber-400',
		hoverBg: 'hover:bg-amber-200',
		darkHoverBg: 'dark:hover:bg-amber-900/50',
		icon: 'F'
	},
} as const;

export type FastColorKey = keyof typeof FAST_COLORS;

export const getFastColors = (description: string | null) => {
	if (!description) return null;
	return FAST_COLORS[description as FastColorKey] || FAST_COLORS.default;
};
