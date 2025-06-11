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

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import APPS from '@libs/appconfig/constants/apps';
import {
  AiChatIcon,
  AppleLogo,
  BackupIcon,
  EducationIcon,
  LernmanagementIcon,
  MobileLogoIcon,
  OneSourceIcon,
  ReloadIcon,
  SettingsIcon,
  VideoConferenceIcon,
} from '@/assets/icons';
import useLdapGroups from '@/hooks/useLdapGroups';
import useLanguage from '@/hooks/useLanguage';
import useAppConfigsStore from '@/pages/Settings/AppConfig/appConfigsStore';
import useMailsStore from '@/pages/Mail/useMailsStore';
import useConferenceStore from '@/pages/ConferencePage/ConferencesStore';
import { SETTINGS_PATH } from '@libs/appconfig/constants/appConfigPaths';
import getDisplayName from '@/utils/getDisplayName';
import useBulletinBoardStore from '@/pages/BulletinBoard/useBulletinBoardStore';
import { SidebarMenuItem } from '@libs/ui/types/sidebar';
import { CNavGroup, CSidebar, CSidebarFooter, CSidebarHeader, CSidebarNav } from '@coreui/react';
import SidebarItem from '@/components/ui/Sidebar/SidebarMenuItems/SidebarItem';
import UserMenuButton from '@/components/ui/Sidebar/SidebarMenuItems/UserMenuButton';
import DASHBOARD_ROUTE from '@libs/dashboard/constants/dashboardRoute';
import { GroupIconGrid } from '@/components/ui/Sidebar/GroupIconGrid';
import { Button } from '@/components/shared/Button';
import './sidebar.css';
import { BiLockOpen, BiSolidLock } from 'react-icons/bi';
import {
  LANGUAGE_PATH,
  MAILS_PATH,
  SECURITY_PATH,
  USER_DETAILS_PATH,
} from '@libs/userSettings/constants/user-settings-endpoints';
import { CLASS_MANAGEMENT_PATH } from '@libs/classManagement/constants/classManagementPaths';

const Sidebar = () => {
  const { t } = useTranslation();
  const { appConfigs } = useAppConfigsStore();
  const { isSuperAdmin } = useLdapGroups();
  const { language } = useLanguage();

  const { mails } = useMailsStore();
  const { runningConferences } = useConferenceStore();
  const { bulletinBoardNotifications } = useBulletinBoardStore();
  const [isDocked, setIsDocked] = useState<boolean>(true);

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

  const sidebarAppItems: SidebarMenuItem[] = [
    {
      title: t('home'),
      link: DASHBOARD_ROUTE,
      icon: MobileLogoIcon,
      color: 'bg-ciGreenToBlue',
    },
    {
      title: t('program'),
      link: DASHBOARD_ROUTE,
      icon: AppleLogo,
      color: 'bg-ciGreenToBlue',
      subItems: [
        {
          title: t('changeLang'),
          link: LANGUAGE_PATH,
          icon: SettingsIcon,
          color: 'bg-ciGreenToBlue',
        },
        {
          title: t('previewImage'),
          link: MAILS_PATH,
          icon: AiChatIcon,
          color: 'bg-ciGreenToBlue',
        },
        {
          title: t('projects'),
          link: SECURITY_PATH,
          icon: BackupIcon,
          color: 'bg-ciGreenToBlue',
        },
      ],
    },
    ...appConfigs.slice(0, 4).map((item) => ({
      title: getDisplayName(item, language),
      link: `/${item.name}`,
      icon: item.icon,
      color: 'bg-ciGreenToBlue',
      notificationCounter: getNotificationCounter(item.name),
    })),
    {
      title: t('schoolclass'),
      link: DASHBOARD_ROUTE,
      icon: VideoConferenceIcon,
      color: 'bg-ciGreenToBlue',
      subItems: [
        {
          title: t('schoolbinduser'),
          link: USER_DETAILS_PATH,
          icon: LernmanagementIcon,
          color: 'bg-ciGreenToBlue',
        },
        {
          title: t('server'),
          link: USER_DETAILS_PATH,
          icon: OneSourceIcon,
          color: 'bg-ciGreenToBlue',
        },
        {
          title: t('device'),
          link: `/container`,
          icon: EducationIcon,
          color: 'bg-ciGreenToBlue',
        },
        {
          title: t('project'),
          link: CLASS_MANAGEMENT_PATH,
          icon: ReloadIcon,
          color: 'bg-ciGreenToBlue',
        },
      ],
    },
    ...appConfigs.slice(4).map((item) => ({
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

  return (
    <CSidebar
      placement="end"
      colorScheme="dark"
      unfoldable={!isDocked}
    >
      <Button
        className="h-9 w-full rounded-none border-b border-gray-800 p-0 hover:bg-popover-foreground"
        onClick={() => setIsDocked((prevState) => !prevState)}
      >
        <CSidebarHeader>{isDocked ? <BiSolidLock /> : <BiLockOpen />}</CSidebarHeader>
      </Button>

      <CSidebarNav>
        {sidebarAppItems.map((item) => {
          if (!item.subItems?.length) {
            return (
              <SidebarItem
                key={item.title}
                menuItem={item}
              />
            );
          }

          return (
            <CNavGroup
              key={item.title}
              toggler={<GroupIconGrid item={item} />}
            >
              {item.subItems.map((subItem) => (
                <SidebarItem menuItem={subItem} />
              ))}
            </CNavGroup>
          );
        })}
      </CSidebarNav>

      <CSidebarFooter className="flex cursor-pointer justify-end border-t border-gray-800 p-[8px]">
        <UserMenuButton />
      </CSidebarFooter>
    </CSidebar>
  );
};

export default Sidebar;
