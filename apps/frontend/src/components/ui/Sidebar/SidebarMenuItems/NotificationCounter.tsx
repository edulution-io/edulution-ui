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

interface SidebarItemNotificationProps {
  count: number;
  maxCount?: number;
  className?: string;
}

const NotificationCounter = (props: SidebarItemNotificationProps) => {
  const { count, maxCount = 9, className } = props;

  if (!count || count === 0) {
    return null;
  }

  const displayCount = count > maxCount ? `${maxCount}+` : `${count}`;

  return (
    <span
      className={
        `absolute right-[10px] top-[2px] inline-flex items-center justify-center ` +
        `rounded-full bg-red-600 text-xs font-bold text-white ` +
        `h-5 min-w-[1.25rem] transform px-0 ${ 
        className}`
      }
      aria-label={`${displayCount} new notifications`}
    >
      {displayCount}
    </span>
  );
};

export default NotificationCounter;
