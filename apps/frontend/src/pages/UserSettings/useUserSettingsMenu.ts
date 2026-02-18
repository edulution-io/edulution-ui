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

import { useMemo } from 'react';
import {
  ContactIcon,
  LanguageIcon,
  MailIcon,
  MobileDevicesIcon,
  SecurityIcon,
  UserDetailsSettingsIcon,
  SettingsIcon,
  VPNIcon,
} from '@/assets/icons';
import { useNavigate } from 'react-router-dom';
import {
  USER_INTERFACE_PATH,
  MAILS_PATH,
  MOBILE_ACCESS_PATH,
  SECURITY_PATH,
  USER_DETAILS_PATH,
  USER_SETTINGS_MAILS_PATH,
  USER_SETTINGS_MOBILE_ACCESS_PATH,
  USER_SETTINGS_SECURITY_PATH,
  USER_SETTINGS_USER_DETAILS_PATH,
  USER_SETTINGS_USER_INTERFACE_PATH,
  WIREGUARD_ACCESS_PATH,
  USER_SETTINGS_WIREGUARD_ACCESS_PATH,
  PAIRING_PATH,
  USER_SETTINGS_PAIRING_PATH,
} from '@libs/userSettings/constants/user-settings-endpoints';
import MenuBarEntry from '@libs/menubar/menuBarEntry';
import APPS from '@libs/appconfig/constants/apps';
import GroupRoles from '@libs/groups/types/group-roles.enum';
import useAppConfigsStore from '@/pages/Settings/AppConfig/useAppConfigsStore';
import findAppConfigByName from '@libs/common/utils/findAppConfigByName';
import useLdapGroups from '@/hooks/useLdapGroups';

const useUserSettingsMenu = () => {
  const navigate = useNavigate();
  const appConfigs = useAppConfigsStore((state) => state.appConfigs);
  const { ldapGroups } = useLdapGroups();

  const isMailConfigured = !!findAppConfigByName(appConfigs, APPS.MAIL);
  const isWireguardConfigured = !!findAppConfigByName(appConfigs, APPS.WIREGUARD);
  const isStudent = ldapGroups.includes(GroupRoles.STUDENT);
  const isParent = ldapGroups.includes(GroupRoles.PARENT);
  const isStudentOrParent = isStudent || isParent;

  const USERSETTINGS_MENUBAR_CONFIG: MenuBarEntry = useMemo(
    () => ({
      appName: APPS.USER_SETTINGS,
      title: 'usersettings.title',
      icon: SettingsIcon,
      color: 'hover:bg-ciGreenToBlue',
      menuItems: [
        {
          id: USER_DETAILS_PATH,
          label: 'usersettings.details.title',
          icon: UserDetailsSettingsIcon,
          action: () => navigate(USER_SETTINGS_USER_DETAILS_PATH),
        },
        {
          id: SECURITY_PATH,
          label: 'usersettings.security.title',
          icon: SecurityIcon,
          action: () => navigate(USER_SETTINGS_SECURITY_PATH),
        },
        ...(isMailConfigured
          ? [
              {
                id: MAILS_PATH,
                label: 'usersettings.mails.title',
                icon: MailIcon,
                action: () => navigate(USER_SETTINGS_MAILS_PATH),
              },
            ]
          : []),
        {
          id: USER_INTERFACE_PATH,
          label: 'usersettings.userinterface.title',
          icon: LanguageIcon,
          action: () => navigate(USER_SETTINGS_USER_INTERFACE_PATH),
        },
        {
          id: MOBILE_ACCESS_PATH,
          label: 'usersettings.mobileAccess.title',
          icon: MobileDevicesIcon,
          action: () => navigate(USER_SETTINGS_MOBILE_ACCESS_PATH),
        },
        ...(isWireguardConfigured
          ? [
              {
                id: WIREGUARD_ACCESS_PATH,
                label: 'usersettings.wireguard.title',
                icon: VPNIcon,
                action: () => navigate(USER_SETTINGS_WIREGUARD_ACCESS_PATH),
              },
            ]
          : []),
        ...(isStudentOrParent
          ? [
              {
                id: PAIRING_PATH,
                label: isStudent ? 'usersettings.pairing.myParents' : 'usersettings.pairing.myChildren',
                icon: ContactIcon,
                action: () => navigate(USER_SETTINGS_PAIRING_PATH),
              },
            ]
          : []),
      ],
    }),
    [navigate, isMailConfigured, isWireguardConfigured, isStudentOrParent, isStudent],
  );

  return USERSETTINGS_MENUBAR_CONFIG;
};

export default useUserSettingsMenu;
