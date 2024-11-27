export const LAYOUT_OPTIONS = {
  ONE_COLUMN: 'oneColumn',
  TWO_COLUMN: 'twoColumn',
} as const;

export type LayoutOption = (typeof LAYOUT_OPTIONS)[keyof typeof LAYOUT_OPTIONS];
