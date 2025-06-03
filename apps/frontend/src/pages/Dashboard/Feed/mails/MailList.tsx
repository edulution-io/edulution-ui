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

import React, { ComponentProps } from 'react';
import { NavLink } from 'react-router-dom';
import cn from '@libs/common/utils/className';
import APPS from '@libs/appconfig/constants/apps';
import MailDto from '@libs/mail/types/mail.dto';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { BadgeSH } from '@/components/ui/BadgeSH';
import BadgeLabels from '@libs/dashboard/feed/mails/badge-labels.enum';
import BadgeVariant from '@libs/dashboard/feed/mails/badge-variant.enum';

interface MailListProps {
  items: MailDto[];
  className?: string;
}

const MailList = ({ items, className }: MailListProps) => {
  const renderLabelBadges = (item: MailDto) => {
    if (!item.labels || item.labels.size === 0) {
      return null;
    }

    const getBadgeVariantFromLabel = (label: string): ComponentProps<typeof BadgeSH>['variant'] => {
      if ([BadgeLabels.WORK as string].includes(label.toLowerCase())) {
        return BadgeVariant.DEFAULT;
      }

      if ([BadgeLabels.PERSONAL as string].includes(label.toLowerCase())) {
        return BadgeVariant.OUTLINE;
      }

      return BadgeVariant.SECONDARY;
    };

    const badges = Array.from(item.labels).map((label) => (
      <BadgeSH
        key={`${item.id}-BadgeSH-${label}`}
        variant={getBadgeVariantFromLabel(label)}
      >
        {label}
      </BadgeSH>
    ));

    return <div className="flex items-center gap-2">{badges}</div>;
  };

  return (
    <ScrollArea className={cn('max-h-[470px] overflow-y-auto scrollbar-thin', className)}>
      <div className="flex flex-col gap-2 py-2 pt-0">
        {items.map((item) => (
          <NavLink
            to={APPS.MAIL}
            key={item.id}
            className="w-min-[300px] flex flex-col items-start gap-2 rounded-lg border p-2 text-left transition-all hover:bg-accent"
          >
            <div className="flex w-full">
              <span className="break-all text-sm font-semibold">
                {item.from?.value[0].name || item.from?.value[0].address}
              </span>
              <div className="relative mx-2">
                <p className="absolute h-2 w-2 rounded-full bg-ciLightGreen" />
              </div>
            </div>
            {renderLabelBadges(item)}
          </NavLink>
        ))}
      </div>
    </ScrollArea>
  );
};

export default MailList;
