/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
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
            <p className="break-all text-sm">{item.subject}</p>
            <p className="line-clamp-2 break-all text-xs text-muted-foreground">{item.text?.substring(0, 300)}</p>
            {renderLabelBadges(item)}
          </NavLink>
        ))}
      </div>
    </ScrollArea>
  );
};

export default MailList;
