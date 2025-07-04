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

import { useTranslation } from 'react-i18next';
import APPS from '@libs/appconfig/constants/apps';
import { Dashboard, SettingsIcon } from '@/assets/icons';
import useLdapGroups from '@/hooks/useLdapGroups';
import useLanguage from '@/hooks/useLanguage';
import useAppConfigsStore from '@/pages/Settings/AppConfig/appConfigsStore';
import useMailsStore from '@/pages/Mail/useMailsStore';
import useConferenceStore from '@/pages/ConferencePage/useConferenceStore';
import useBulletinBoardStore from '@/pages/BulletinBoard/useBulletinBoardStore';
import { SETTINGS_PATH } from '@libs/appconfig/constants/appConfigPaths';
import DASHBOARD_ROUTE from '@libs/dashboard/constants/dashboardRoute';
import getDisplayName from '@/utils/getDisplayName';
import { SidebarMenuItem } from '@libs/ui/types/sidebar';

const useSidebarItems = (): SidebarMenuItem[] => {
  const { t } = useTranslation();
  const { appConfigs } = useAppConfigsStore();
  const { isSuperAdmin } = useLdapGroups();
  const { language } = useLanguage();

  const { mails } = useMailsStore();
  const { runningConferences } = useConferenceStore();
  const { bulletinBoardNotifications } = useBulletinBoardStore();

  const getNotificationCounter = (app: string): number | undefined => {
    switch (app) {
      case APPS.MAIL:
        return mails.length;
      case APPS.CONFERENCES:
        return runningConferences.length;
      case APPS.BULLETIN_BOARD:
        return bulletinBoardNotifications.length;
      default:
        return undefined;
    }
  };

  return [
    {
      title: t('dashboard.pageTitle'),
      link: DASHBOARD_ROUTE,
      icon: Dashboard,
      color: 'bg-ciGreenToBlue',
    },
    ...appConfigs.map((cfg) => ({
      title: getDisplayName(cfg, language),
      link: `/${cfg.name}`,
      icon: cfg.icon,
      color: 'bg-ciGreenToBlue',
      notificationCounter: getNotificationCounter(cfg.name),
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
};

export default useSidebarItems;
