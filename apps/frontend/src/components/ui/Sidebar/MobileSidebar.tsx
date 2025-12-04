/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
 */

import React, { useCallback, useRef } from 'react';
import { useOnClickOutside } from 'usehooks-ts';
import { SidebarProps } from '@libs/ui/types/sidebar';
import usePlatformStore from '@/store/EduApiStore/usePlatformStore';
import cn from '@libs/common/utils/className';
import APPLICATION_NAME from '@libs/common/constants/applicationName';
import { HomeButton, MobileSidebarItem, UserMenuButton } from './SidebarMenuItems';
import useSidebarStore from './useSidebarStore';

const MobileSidebar: React.FC<SidebarProps> = ({ sidebarItems }) => {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { isMobileSidebarOpen, toggleMobileSidebar } = useSidebarStore();
  const isEdulutionApp = usePlatformStore((state) => state.isEdulutionApp);

  const sidebarClassName = isEdulutionApp ? '' : 'lg:bg-none';

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
    <>
      <div
        className="fixed bottom-0 left-0 z-[400] rounded-tr-md bg-secondary px-2 py-1 text-xs text-background shadow-xl shadow-slate-500 transition-transform duration-300 ease-in-out dark:bg-black dark:shadow-black"
        style={{ transform: `translateX(${isMobileSidebarOpen ? '0%' : '-100%'})` }}
      >
        <div>v{APP_VERSION}</div>
        <div>&copy; {APPLICATION_NAME}.</div>
      </div>

      <div
        className="fixed right-0 top-0 z-[400] h-full w-full transform transition-transform duration-300 ease-in-out"
        style={{ transform: `translateX(${isMobileSidebarOpen ? '0%' : '100%'})` }}
      >
        <div
          ref={sidebarRef}
          className={cn(
            'fixed right-0 h-full min-w-[260px] border-l-[1px] border-muted bg-secondary text-background shadow-xl shadow-slate-500 dark:bg-black dark:shadow-black',
            sidebarClassName,
          )}
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
    </>
  );
};

export default MobileSidebar;
