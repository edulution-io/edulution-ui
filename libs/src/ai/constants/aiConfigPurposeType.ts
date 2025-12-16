import AI_CONFIG_PURPOSES from '@libs/ai/types/aiConfigPurposes';

export type AiConfigPurposeType = (typeof AI_CONFIG_PURPOSES)[keyof typeof AI_CONFIG_PURPOSES];
