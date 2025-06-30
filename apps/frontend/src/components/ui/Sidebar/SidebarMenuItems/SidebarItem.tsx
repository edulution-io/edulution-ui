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
import { SIDEBAR_WIDTH } from '@libs/ui/constants';
import { SidebarMenuItemProps } from '@libs/ui/types/sidebar';
import { getRootPathName } from '@libs/common/utils';
import NotificationCounter from '@/components/ui/Sidebar/SidebarMenuItems/NotificationCounter';
import PageTitle from '@/components/PageTitle';
import useTrulyVisible from '@/hooks/useTrulyVisible';
import DynamicEllipsis from '@/components/shared/DynamicEllipsis';
import SidebarItemPopover from '@/components/ui/Sidebar/SidebarMenuItems/SidebarItemPopover';
import SidebarItemIcon from '@/components/ui/Sidebar/SidebarMenuItems/SidebarItemIcon';

const SidebarItem: React.FC<SidebarMenuItemProps> = ({
  menuItem,
  translate,
  isUpButtonVisible,
  isDownButtonVisible,
}) => {
  const { title, icon, color, link, notificationCounter = 0 } = menuItem;
  const buttonRef = useRef<HTMLDivElement>(null);
  const isTrulyVisible = useTrulyVisible(buttonRef, [translate, isUpButtonVisible, isDownButtonVisible]);
  const { pathname } = useLocation();
  const rootPathName = getRootPathName(pathname);
  const isSelected = rootPathName === link;

  const [isHovered, setIsHovered] = useState(false);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    let frame: number;

    if (isHovered && buttonRef.current) {
      const tick = () => {
        setAnchorRect(buttonRef.current!.getBoundingClientRect());
        frame = requestAnimationFrame(tick);
      };
      tick();
    } else {
      setAnchorRect(null);
    }

    return () => {
      if (frame) {
        cancelAnimationFrame(frame);
      }
    };
  }, [isHovered]);

  return (
    <div
      className="relative"
      ref={buttonRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-selected={isSelected ? 'true' : undefined}
    >
      {isSelected && <PageTitle translationId={title} />}
      <NavLink
        to={link}
        className={`
          group relative z-40 flex h-14 cursor-pointer items-center
          justify-end gap-4 px-4 py-2 md:block md:px-0
          ${isSelected ? color : ''}
        `}
      >
        <p className="md:hidden">{title}</p>

        <div
          className="flex h-full flex-col justify-center pt-1 text-center"
          style={{ width: SIDEBAR_WIDTH }}
        >
          <SidebarItemIcon
            isHovered={isHovered}
            iconSrc={icon}
            title={title}
          />

          <NotificationCounter count={notificationCounter} />

          <div className="-mt-[0.15rem] hidden h-5 text-center md:block">
            <DynamicEllipsis
              text={title}
              className="text-[10px]"
            />
          </div>
        </div>
      </NavLink>

      {anchorRect && isTrulyVisible && (
        <SidebarItemPopover
          anchorRect={anchorRect}
          color={color}
          title={title}
          iconSrc={icon}
          iconAlt={`${title}-icon`}
          isHovered={isHovered}
        />
      )}
    </div>
  );
};

export default SidebarItem;
