/**
 * Primitives shared by every liturgical service — content lines, section roles,
 * conditions, and the resolver that turns conditional blocks into flat content.
 *
 * See docs/CONDITIONAL-RESOLUTION.md.
 */
export type {
	ContentLine,
	ContentSpeaker,
	LiturgicalCondition,
	LiturgicalConditionalBlock,
	LiturgicalContent,
	LiturgicalSectionRole,
	ResolutionMode,
} from './types'
export { CONTENT_SPEAKERS, SECTION_ROLES, SERVICE_LANGUAGES, type ServiceLanguage } from './types'
export {
	type OccasionContext,
	findOneModeAuthoringErrors,
	matchesCondition,
	resolveBlocks,
} from './resolve'
