/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

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
