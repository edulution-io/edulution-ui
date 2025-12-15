import toolInvocationStates from '@libs/mcp/constants/toolInvocationStates';

export type ToolInvocationStatesType = (typeof toolInvocationStates)[keyof typeof toolInvocationStates];
