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

import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useWindowSize } from 'usehooks-ts';
import { SIDEBAR_ICON_WIDTH, SIDEBAR_TRANSLATE_AMOUNT } from '@libs/ui/constants';
import { SidebarMenuItemProps } from '@libs/ui/types/sidebar';
import { getRootPathName } from '@libs/common/utils';
import SidebarItemNotification from '@/components/ui/Sidebar/SidebarMenuItems/SidebarItemNotification';

const SidebarItem: React.FC<SidebarMenuItemProps> = ({ menuItem, isDesktop, translate }) => {
  const { title, icon, color, link, notificationCounter } = menuItem;
  const buttonRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const size = useWindowSize();
  const { pathname } = useLocation();

  const rootPathName = getRootPathName(pathname);

  useEffect(() => {
    if (buttonRef.current == null) return;

    const rect = buttonRef.current.getBoundingClientRect();
    setIsInView(rect.bottom < window.innerHeight - SIDEBAR_TRANSLATE_AMOUNT);
  }, [translate, size]);

  return (
    <div
      key={title}
      className="relative"
      ref={buttonRef}
    >
      <NavLink
        to={link}
        className={`group relative z-[99] flex cursor-pointer items-center justify-end gap-4 px-4 py-2 md:block md:px-2 ${rootPathName === menuItem.link && pathname !== '/' ? menuItem.color : ''}`}
      >
        <p className="md:hidden">{title}</p>
        <>
          <img
            src={icon}
            width={SIDEBAR_ICON_WIDTH}
            className="relative z-0"
            alt={`${title}-icon`}
          />
          <SidebarItemNotification notificationCounter={notificationCounter} />
        </>
        {isInView ? (
          <div
            className={`${color} absolute left-full top-0 flex h-full items-center gap-4 rounded-l-[8px] pl-4 pr-[48px] ${isDesktop ? 'ease-out group-hover:-translate-x-full' : ''}`}
          >
            <p className="whitespace-nowrap font-bold">{title}</p>
            <img
              src={icon}
              width={SIDEBAR_ICON_WIDTH}
              alt={`${title}-icon`}
            />
          </div>
        ) : null}
      </NavLink>
    </div>
  );
};

export default SidebarItem;
