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
    <ScrollArea className={cn('max-h-[470px] overflow-y-auto scrollbar-thin', className)}>
      <div className="flex flex-col gap-2 py-2 pt-0">
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
      </div>
    </ScrollArea>
  );
};

export default BulletinList;
