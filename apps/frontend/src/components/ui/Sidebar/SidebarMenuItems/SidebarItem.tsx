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

import React, { useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { SIDEBAR_ICON_WIDTH, SIDEBAR_WIDTH } from '@libs/ui/constants';
import { SidebarMenuItemProps } from '@libs/ui/types/sidebar';
import { getRootPathName } from '@libs/common/utils';
import SidebarItemNotification from '@/components/ui/Sidebar/SidebarMenuItems/SidebarItemNotification';
import PageTitle from '@/components/PageTitle';
import useTrulyVisible from '@/hooks/useTrulyVisible';
import DASHBOARD_ROUTE from '@libs/dashboard/constants/dashboardRoute';
import DynamicEllipsis from '@/components/shared/DynamicEllipsis';
import { SIDEBAR_ICON_HEIGHT } from '@libs/ui/constants/sidebar';

const SidebarItem: React.FC<SidebarMenuItemProps> = ({
  menuItem,
  isDesktop,
  translate,
  isUpButtonVisible,
  isDownButtonVisible,
}) => {
  const { title, icon, color, link, notificationCounter } = menuItem;
  const buttonRef = useRef<HTMLDivElement>(null);
  const isTrulyVisible = useTrulyVisible(buttonRef, [translate, isUpButtonVisible, isDownButtonVisible]);
  const { pathname } = useLocation();

  const rootPathName = getRootPathName(pathname);

  const isCurrentlySelectedItem = rootPathName === menuItem.link && pathname !== DASHBOARD_ROUTE;

  const iconElement = (
    <div
      style={{ height: SIDEBAR_ICON_HEIGHT, width: SIDEBAR_ICON_WIDTH }}
      className="relative z-0 -mt-2 ml-[0.8rem] flex items-center justify-center"
    >
      <img
        src={icon}
        height={SIDEBAR_ICON_HEIGHT}
        width={SIDEBAR_ICON_WIDTH}
        className="max-h-full max-w-full origin-top transform transition-transform duration-200 group-hover:scale-[1.17]"
        alt={`${title}-icon`}
      />
    </div>
  );

  return (
    <div
      key={title}
      className="relative"
      ref={buttonRef}
    >
      {isCurrentlySelectedItem && <PageTitle translationId={title} />}

      <NavLink
        to={link}
        className={`group relative z-40 flex h-14 cursor-pointer items-center justify-end gap-4 px-4 py-2 md:block md:px-0 ${isCurrentlySelectedItem ? menuItem.color : ''}`}
      >
        <p className="md:hidden">{title}</p>

        <div
          className="flex h-full flex-col justify-center pt-1 text-center"
          style={{ width: SIDEBAR_WIDTH }}
        >
          {iconElement}

          <SidebarItemNotification notificationCounter={notificationCounter} />

          <p className="-mt-[0.15rem] hidden h-5 text-center md:block">
            <DynamicEllipsis
              text={title}
              className="text-[10px]"
            />
          </p>
        </div>

        {isTrulyVisible ? (
          <div
            className={`${color} absolute left-full top-0 z-40 flex h-full items-center gap-4 rounded-l-[8px] pl-4 pr-[13px] ${isDesktop ? 'ease-out group-hover:-translate-x-full' : ''}`}
          >
            <p className="whitespace-nowrap font-bold">{title}</p>
            {iconElement}
          </div>
        ) : null}
      </NavLink>
    </div>
  );
};

export default SidebarItem;
