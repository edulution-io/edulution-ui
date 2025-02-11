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
import NATIVE_APP_CONFIG_OPTIONS from '@/pages/Settings/AppConfig/nativeAppConfigOptions';
import useIsMobileView from '@/hooks/useIsMobileView';
import useLdapGroups from '@/hooks/useLdapGroups';
import useAppConfigsStore from '@/pages/Settings/AppConfig/appConfigsStore';
import useMailsStore from '@/pages/Mail/useMailsStore';
import useConferenceStore from '@/pages/ConferencePage/ConferencesStore';
import type TApps from '@libs/appconfig/types/appsType';
import { SETTINGS_PATH } from '@libs/appconfig/constants/appConfigPaths';
import findAppConfigByName from '@libs/common/utils/findAppConfigByName';
import DesktopSidebar from './DesktopSidebar';
import MobileSidebar from './MobileSidebar';

const Sidebar: React.FC = () => {
  const { t } = useTranslation();
  const { appConfigs } = useAppConfigsStore();
  const { isSuperAdmin } = useLdapGroups();
  const isMobileView = useIsMobileView();

  const { mails } = useMailsStore();
  const { runningConferences } = useConferenceStore();

  const getNotificationCounter = (app: TApps): number | undefined => {
    switch (app) {
      case APPS.MAIL:
        return mails.length || 0;
      case APPS.CONFERENCES:
        return runningConferences.length || 0;
      default:
        return undefined;
    }
  };

  const sidebarItems = [
    ...NATIVE_APP_CONFIG_OPTIONS.filter((option) => findAppConfigByName(appConfigs, option.id)).map((item) => ({
      title: t(`${item.id}.sidebar`),
      link: `/${item.id}`,
      icon: item.icon,
      color: 'bg-ciGreenToBlue',
      notificationCounter: getNotificationCounter(item.id),
    })),
    ...(isSuperAdmin
      ? [
          {
            title: t('settings.sidebar'),
            link: SETTINGS_PATH,
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
