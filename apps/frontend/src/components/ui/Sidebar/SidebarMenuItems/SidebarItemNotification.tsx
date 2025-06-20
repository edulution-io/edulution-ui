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
import { FaStarOfLife } from 'react-icons/fa';

interface SidebarItemNotificationProps {
  notificationCounter?: number;
}

const SidebarItemNotification = (props: SidebarItemNotificationProps) => {
  const { notificationCounter } = props;

  if (!notificationCounter || notificationCounter === 0) {
    return null;
  }

  return (
    <FaStarOfLife
      size={12}
      className="absolute right-[20%] top-[10%] text-ciLightGreen"
    />
  );
};

export default SidebarItemNotification;
