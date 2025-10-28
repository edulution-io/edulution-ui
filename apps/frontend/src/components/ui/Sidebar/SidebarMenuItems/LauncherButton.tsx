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
import { MobileLogoIcon } from '@/assets/icons';
import { SIDEBAR_ICON_WIDTH } from '@libs/ui/constants';
import { useTranslation } from 'react-i18next';
import useLauncherStore from '@/components/ui/Launcher/useLauncherStore';
import useSidebarItems from '@/hooks/useSidebarItems';
import NotificationCounter from '@/components/ui/Sidebar/SidebarMenuItems/NotificationCounter';

const LauncherButton: React.FC = () => {
  const { t } = useTranslation();
  const { toggleLauncher } = useLauncherStore();
  const sidebarItems = useSidebarItems();

  const totalNotifications = sidebarItems.reduce((sum, item) => sum + (item.notificationCounter ?? 0), 0);

  return (
    <button
      type="button"
      onClick={toggleLauncher}
      className="group relative z-50 flex max-h-14 w-full items-center justify-end gap-4 bg-black px-4 py-2 md:block md:px-3"
    >
      <p className="text-md font-bold md:hidden">{t('launcher.title')}</p>

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
