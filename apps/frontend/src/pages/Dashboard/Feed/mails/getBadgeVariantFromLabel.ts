import { ComponentProps } from 'react';
import { BadgeSH } from '@/components/ui/BadgeSH';
import BadgeLabels from '@libs/dashboard/feed/mails/badge-labels.enum';
import BadgeVariant from '@libs/dashboard/feed/mails/badge-variant.enum';

function getBadgeVariantFromLabel(label: string): ComponentProps<typeof BadgeSH>['variant'] {
  if ([BadgeLabels.WORK as string].includes(label.toLowerCase())) {
    return BadgeVariant.DEFAULT;
  }

  if ([BadgeLabels.PERSONAL as string].includes(label.toLowerCase())) {
    return BadgeVariant.OUTLINE;
  }

  return BadgeVariant.SECONDARY;
}

export default getBadgeVariantFromLabel;
