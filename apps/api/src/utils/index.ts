export const range = (min: number, max: number) =>
	[...Array(max - min + 1).keys()].map((i) => i + min)
