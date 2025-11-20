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
import { MobileLogoIcon } from '@/assets/icons';
import { SIDEBAR_ICON_WIDTH } from '@libs/ui/constants';
import { useTranslation } from 'react-i18next';
import useLauncherStore from '@/components/ui/Launcher/useLauncherStore';
import useSidebarItems from '@/hooks/useSidebarItems';
import NotificationCounter from '@/components/ui/Sidebar/SidebarMenuItems/NotificationCounter';
import usePlatformStore from '@/store/EduApiStore/usePlatformStore';
import cn from '@libs/common/utils/className';

const LauncherButton: React.FC = () => {
  const { t } = useTranslation();
  const { toggleLauncher } = useLauncherStore();
  const sidebarItems = useSidebarItems();
  const isEdulutionApp = usePlatformStore((state) => state.isEdulutionApp);

  const totalNotifications = sidebarItems.reduce((sum, item) => sum + (item.notificationCounter ?? 0), 0);

  const buttonClassName = isEdulutionApp ? '' : 'lg:block lg:px-3';
  const titleClassName = isEdulutionApp ? '' : 'lg:hidden';

  return (
    <button
      type="button"
      onClick={toggleLauncher}
      className={cn(
        'group relative z-50 flex max-h-14 w-full items-center justify-end gap-4 bg-black px-4 py-2',
        buttonClassName,
      )}
    >
      <p className={cn('text-md font-bold', titleClassName)}>{t('launcher.title')}</p>

      <MobileLogoIcon
        className="g transform rounded-full transition-transform duration-200 group-hover:scale-[1.3]"
        width={SIDEBAR_ICON_WIDTH}
        aria-label="edulution-mobile-logo"
      />

      <NotificationCounter count={totalNotifications} />
    </button>
  );
};

export default LauncherButton;
