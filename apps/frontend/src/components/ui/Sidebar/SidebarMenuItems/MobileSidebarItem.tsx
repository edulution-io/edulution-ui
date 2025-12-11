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
