export const LMN_API_COLLECT_OPERATIONS = {
  CUT: 'cut',
  COPY: 'copy',
} as const;

export type LmnApiCollectOperation = (typeof LMN_API_COLLECT_OPERATIONS)[keyof typeof LMN_API_COLLECT_OPERATIONS];
