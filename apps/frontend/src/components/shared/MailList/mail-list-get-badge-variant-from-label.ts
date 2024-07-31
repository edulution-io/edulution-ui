import { ComponentProps } from 'react';
import { BadgeSH } from '@/components/ui/BadgeSH';

export enum BadgeLabels {
  WORK = 'work',
  PERSONAL = 'personal',
}

export enum BadgeVariant {
  DEFAULT = 'default',
  OUTLINE = 'outline',
  SECONDARY = 'secondary',
}

export function getBadgeVariantFromLabel(label: string): ComponentProps<typeof BadgeSH>['variant'] {
  if ([BadgeLabels.WORK as string].includes(label.toLowerCase())) {
    return BadgeVariant.DEFAULT;
  }

  if ([BadgeLabels.PERSONAL as string].includes(label.toLowerCase())) {
    return BadgeVariant.OUTLINE;
  }

  return BadgeVariant.SECONDARY;
}
