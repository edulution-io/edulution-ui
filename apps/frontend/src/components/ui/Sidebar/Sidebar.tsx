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
import { useTranslation } from 'react-i18next';
import APPS from '@libs/appconfig/constants/apps';
import { SettingsIcon } from '@/assets/icons';
import useMedia from '@/hooks/useMedia';
import useLdapGroups from '@/hooks/useLdapGroups';
import useLanguage from '@/hooks/useLanguage';
import useAppConfigsStore from '@/pages/Settings/AppConfig/appConfigsStore';
import useMailsStore from '@/pages/Mail/useMailsStore';
import useConferenceStore from '@/pages/ConferencePage/ConferencesStore';
import { SETTINGS_PATH } from '@libs/appconfig/constants/appConfigPaths';
import getDisplayName from '@/utils/getDisplayName';
import useBulletinBoardStore from '@/pages/BulletinBoard/useBulletinBoardStore';
import DesktopSidebar from './DesktopSidebar';
import MobileSidebar from './MobileSidebar';

const Sidebar: React.FC = () => {
  const { t } = useTranslation();
  const { appConfigs } = useAppConfigsStore();
  const { isSuperAdmin } = useLdapGroups();
  const { isMobileView } = useMedia();
  const { language } = useLanguage();

  const { mails } = useMailsStore();
  const { runningConferences } = useConferenceStore();
  const { bulletinBoardNotifications } = useBulletinBoardStore();

  const getNotificationCounter = (app: string): number | undefined => {
    switch (app) {
      case APPS.MAIL:
        return mails.length || 0;
      case APPS.CONFERENCES:
        return runningConferences.length;
      case APPS.BULLETIN_BOARD:
        return bulletinBoardNotifications.length;
      default:
        return undefined;
    }
  };

  const sidebarItems = [
    ...appConfigs.map((item) => ({
      title: getDisplayName(item, language),
      link: `/${item.name}`,
      icon: item.icon,
      color: 'bg-ciGreenToBlue',
      notificationCounter: getNotificationCounter(item.name),
    })),
    ...(isSuperAdmin
      ? [
          {
            title: t('settings.sidebar'),
            link: `/${SETTINGS_PATH}`,
            icon: SettingsIcon,
            color: 'bg-ciGreenToBlue',
          },
        ]
      : []),
  ];

  const sidebarProps = {
    sidebarItems,
  };

  return isMobileView ? <MobileSidebar {...sidebarProps} /> : <DesktopSidebar {...sidebarProps} />;
};

export default Sidebar;
