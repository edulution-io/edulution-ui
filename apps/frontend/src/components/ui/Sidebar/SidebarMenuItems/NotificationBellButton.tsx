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

import React, { useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import useNotificationStore from '@/store/useNotificationStore';
import NotificationCounter from '@/components/ui/Sidebar/SidebarMenuItems/NotificationCounter';
import usePlatformStore from '@/store/EduApiStore/usePlatformStore';
import useSidebarStore from '@/components/ui/Sidebar/useSidebarStore';
import cn from '@libs/common/utils/className';
import NotificationPanel from '@/pages/NotificationsCenter/components/NotificationPanel';
import { Button } from '@/components/shared/Button';

const NotificationBellButton = () => {
  const { t } = useTranslation();
  const { unreadCount, isSheetOpen, setIsSheetOpen } = useNotificationStore();
  const isEdulutionApp = usePlatformStore((state) => state.isEdulutionApp);
  const { isMobileSidebarOpen, toggleMobileSidebar } = useSidebarStore();

  const wasSheetOpenOnPointerDown = useRef(false);

  const buttonClassName = isEdulutionApp ? '' : 'lg:block lg:px-3';
  const titleClassName = isEdulutionApp ? '' : 'lg:hidden';

  const handlePointerDown = () => {
    wasSheetOpenOnPointerDown.current = isSheetOpen;
  };

  const handleClick = () => {
    if (isMobileSidebarOpen) {
      toggleMobileSidebar();
    }
    setIsSheetOpen(!wasSheetOpenOnPointerDown.current);
  };

  return (
    <>
      <Button
        onPointerDown={handlePointerDown}
        onClick={handleClick}
        className={cn(
          'group relative flex max-h-14 w-full items-center justify-end gap-4 px-4 py-2 hover:bg-muted-background',
          buttonClassName,
        )}
      >
        <p className={cn('text-md font-bold', titleClassName)}>{t('notificationscenter.sidebar')}</p>

        <div className="relative flex h-10 w-10 items-center justify-center">
          <FontAwesomeIcon
            icon={faBell}
            className="transform text-xl transition-transform duration-200 group-hover:scale-110"
          />
          <NotificationCounter count={unreadCount} />
        </div>
      </Button>
      <NotificationPanel />
    </>
  );
};

export default NotificationBellButton;
