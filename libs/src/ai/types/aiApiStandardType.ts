import AI_API_STANDARDS from '@libs/ai/constants/aiApiStandards';

export type AiApiStandardType = (typeof AI_API_STANDARDS)[keyof typeof AI_API_STANDARDS];
