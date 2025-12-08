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

import React from 'react';
import cn from '@libs/common/utils/className';
import { ScrollArea } from '@/components/ui/ScrollArea';
import useBulletinBoardStore from '@/pages/BulletinBoard/useBulletinBoardStore';
import { NavLink } from 'react-router-dom';
import APPS from '@libs/appconfig/constants/apps';
import { format } from 'date-fns/format';
import getLocaleDateFormat from '@libs/common/utils/getLocaleDateFormat';

interface BulletinListProps {
  className?: string;
}

const BulletinList = (props: BulletinListProps) => {
  const { className } = props;
  const { bulletinBoardNotifications } = useBulletinBoardStore();

  const locale = getLocaleDateFormat();

  return (
    <ScrollArea className={cn('flex max-h-[470px] flex-col gap-2 overflow-y-auto py-2 pt-0 scrollbar-thin', className)}>
      {bulletinBoardNotifications.map((bulletin) => (
        <NavLink
          to={`${APPS.BULLETIN_BOARD}/${bulletin.id}`}
          key={bulletin.id}
          className="w-min-[300px] flex flex-col items-start gap-2 rounded-lg border border-muted-foreground p-2 text-left transition-all hover:bg-ciDarkGrey"
        >
          <div className="flex w-full flex-col gap-1">
            <span className="text-sm font-semibold">{bulletin.title}</span>
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {format(bulletin.createdAt, 'dd. MMMM', { locale })}
            </p>
          </div>
        </NavLink>
      ))}
    </ScrollArea>
  );
};

export default BulletinList;
