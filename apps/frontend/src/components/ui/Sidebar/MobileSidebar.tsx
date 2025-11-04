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

import React, { useCallback, useRef } from 'react';
import { useOnClickOutside } from 'usehooks-ts';
import { SidebarProps } from '@libs/ui/types/sidebar';
import { HomeButton, MobileSidebarItem, UserMenuButton } from './SidebarMenuItems';
import useSidebarStore from './useSidebarStore';

const MobileSidebar: React.FC<SidebarProps> = ({ sidebarItems }) => {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { isMobileSidebarOpen, toggleMobileSidebar } = useSidebarStore();

  const handleClickOutside = useCallback(
    (event: MouseEvent | TouchEvent) => {
      const isSidebarRef = sidebarRef.current && !sidebarRef.current.contains(event.target as Node);
      if (isMobileSidebarOpen && isSidebarRef) {
        toggleMobileSidebar();
      }
    },
    [isMobileSidebarOpen, toggleMobileSidebar],
  );

  useOnClickOutside(sidebarRef, handleClickOutside);

  const sidebarHeightWithoutSpecialButtons = 'h-[calc(100%-121px)]';

  return (
    <div
      className="fixed right-0 top-0 z-[400] h-full w-full transform transition-transform duration-300 ease-in-out"
      style={{ transform: `translateX(${isMobileSidebarOpen ? '0%' : '100%'})` }}
    >
      <div
        ref={sidebarRef}
        className="fixed right-0 h-full min-w-[260px] border-l-[1px] border-muted bg-black lg:bg-none"
      >
        <div className="h-1" />

        <HomeButton />

        <div
          className={`${sidebarHeightWithoutSpecialButtons} overflow-auto border-b-[1px] border-t-[1px] border-muted `}
        >
          {sidebarItems.map((item) => (
            <MobileSidebarItem
              key={item.link}
              menuItem={item}
            />
          ))}
        </div>

        <UserMenuButton />
      </div>
    </div>
  );
};

export default MobileSidebar;
