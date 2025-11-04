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
import PageTitle from '@/components/PageTitle';
import useSidebarStore from '../useSidebarStore';

const MobileSidebarItem: React.FC<SidebarMenuItemProps> = ({
  menuItem: { color, icon, link, notificationCounter, title },
}) => {
  const { pathname } = useLocation();
  const { toggleMobileSidebar } = useSidebarStore();

  const rootPathName = getRootPathName(pathname);
  const isSelected = rootPathName === link;
  const menuItemColor = isSelected && pathname !== ROOT_ROUTE ? color : '';

  return (
    <div
      key={title}
      className="relative"
    >
      {isSelected && <PageTitle translationId={title} />}
      <NavLink
        to={link}
        onClick={toggleMobileSidebar}
        className={`group relative flex cursor-pointer items-center justify-end gap-4 px-4 py-2 lg:block lg:px-2 ${menuItemColor}`}
      >
        <p className="lg:hidden">{title}</p>

        <img
          src={icon}
          width={SIDEBAR_ICON_WIDTH}
          className="relative"
          alt={`${title}-icon`}
        />
      </NavLink>

      <NotificationCounter count={notificationCounter || 0} />
    </div>
  );
};

export default MobileSidebarItem;
