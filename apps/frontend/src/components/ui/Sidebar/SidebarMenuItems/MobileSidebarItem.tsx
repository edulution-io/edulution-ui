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
import usePlatformStore from '@/store/EduApiStore/usePlatformStore';
import cn from '@libs/common/utils/className';
import useSidebarStore from '../useSidebarStore';

const MobileSidebarItem: React.FC<SidebarMenuItemProps> = ({
  menuItem: { color, icon, link, notificationCounter, title },
}) => {
  const { pathname } = useLocation();
  const { toggleMobileSidebar } = useSidebarStore();
  const isEdulutionApp = usePlatformStore((state) => state.isEdulutionApp);

  const rootPathName = getRootPathName(pathname);
  const isSelected = rootPathName === link;
  const menuItemColor = isSelected && pathname !== ROOT_ROUTE ? color : '';

  const navLinkClassName = isEdulutionApp ? '' : 'lg:block lg:px-2';
  const titleClassName = isEdulutionApp ? '' : 'lg:hidden';

  return (
    <div
      key={title}
      className="relative"
    >
      {isSelected && <PageTitle translationId={title} />}
      <NavLink
        to={link}
        onClick={toggleMobileSidebar}
        className={cn(
          'group relative flex cursor-pointer items-center justify-end gap-4 px-4 py-2',
          menuItemColor,
          navLinkClassName,
        )}
      >
        <p className={titleClassName}>{title}</p>

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
