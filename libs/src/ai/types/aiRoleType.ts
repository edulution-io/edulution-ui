import AI_ROLES from '@libs/ai/constants/aiRoles';

export type AiRole = (typeof AI_ROLES)[keyof typeof AI_ROLES];
