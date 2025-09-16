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
import { NavLink, useLocation } from 'react-router-dom';
import { SIDEBAR_ICON_WIDTH } from '@libs/ui/constants';
import { SidebarMenuItemProps } from '@libs/ui/types/sidebar';
import { getRootPathName } from '@libs/common/utils';
import ROOT_ROUTE from '@libs/common/constants/rootRoute';
import NotificationCounter from '@/components/ui/Sidebar/SidebarMenuItems/NotificationCounter';
import useSidebarStore from '../useSidebarStore';

const MobileSidebarItem: React.FC<SidebarMenuItemProps> = ({ menuItem }) => {
  const { pathname } = useLocation();
  const { toggleMobileSidebar } = useSidebarStore();

  const rootPathName = getRootPathName(pathname);
  const menuItemColor = rootPathName === menuItem.link && pathname !== ROOT_ROUTE ? menuItem.color : '';

  return (
    <div
      key={menuItem.title}
      className="relative"
    >
      <NavLink
        to={menuItem.link}
        onClick={toggleMobileSidebar}
        className={`group relative flex cursor-pointer items-center justify-end gap-4 px-4 py-2 md:block md:px-2 ${menuItemColor}`}
      >
        <p className="md:hidden">{menuItem.title}</p>

        <img
          src={menuItem.icon}
          width={SIDEBAR_ICON_WIDTH}
          className="relative"
          alt={`${menuItem.title}-icon`}
        />
      </NavLink>

      <NotificationCounter count={menuItem.notificationCounter || 0} />
    </div>
  );
};

export default MobileSidebarItem;
