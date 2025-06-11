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
import { SIDEBAR_ICON_WIDTH_PX } from '@libs/ui/constants';
import { SidebarMenuItemProps } from '@libs/ui/types/sidebar';
import { getRootPathName } from '@libs/common/utils';
import SidebarItemNotification from '@/components/ui/Sidebar/SidebarMenuItems/SidebarItemNotification';
import PageTitle from '@/components/PageTitle';
import DASHBOARD_ROUTE from '@libs/dashboard/constants/dashboardRoute';
import { CNavItem } from '@coreui/react';

const SidebarItem: React.FC<SidebarMenuItemProps> = ({ menuItem }) => {
  const { title, icon, link, notificationCounter } = menuItem;
  const { pathname } = useLocation();

  const rootPathName = getRootPathName(pathname);

  const isCurrentlySelectedItem = rootPathName === menuItem.link && pathname !== DASHBOARD_ROUTE;

  return (
    <CNavItem
      key={title}
      className={`h-[56px] min-h-[56px] hover:bg-popover-foreground ${isCurrentlySelectedItem ? menuItem.color : ''}`}
    >
      {isCurrentlySelectedItem && <PageTitle translationId={title} />}

      <NavLink
        to={link}
        className="group flex h-full items-center justify-end pr-3"
      >
        <p className="whitespace-nowrap pr-4 font-bold">{title}</p>
        <>
          <img
            src={icon}
            width={SIDEBAR_ICON_WIDTH_PX}
            alt={`${title}-icon`}
          />
          <SidebarItemNotification notificationCounter={notificationCounter} />
        </>
      </NavLink>
    </CNavItem>
  );
};

export default SidebarItem;
