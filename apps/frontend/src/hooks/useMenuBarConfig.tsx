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
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import APPS from '@libs/appconfig/constants/apps';
import { getFromPathName } from '@libs/common/utils';
import { USER_SETTINGS_PATH } from '@libs/userSettings/constants/user-settings-endpoints';
import useAppConfigPageMenu from '@/pages/Settings/useAppConfigPageMenu';
import useUserSettingsMenuConfig from '@/pages/UserSettings/useUserSettingsMenu';
import useSurveysPageMenu from '@/pages/Surveys/useSurveysPageMenu';
import useFileSharingMenuConfig from '@/pages/FileSharing/useFileSharingMenuConfig';
import useClassManagementMenu from '@/pages/ClassManagement/useClassManagementMenu';
import useLinuxmusterMenu from '@/pages/LinuxmusterPage/useLinuxmusterMenu';
import MenuBarEntry from '@libs/menubar/menuBarEntry';
import MenuItem from '@libs/menubar/menuItem';
import { SETTINGS_PATH } from '@libs/appconfig/constants/appConfigPaths';
import useSubMenuStore from '@/store/useSubMenuStore';
import useScrollToSection from '@/hooks/useScrollToSection';
import useLdapGroups from './useLdapGroups';

const DISABLED_MENU_BAR_ENTRY: MenuBarEntry = {
  menuItems: [],
  title: '',
  icon: '',
  color: '',
  disabled: true,
  appName: APPS.NONE,
};

const useMenuBarConfig = (): MenuBarEntry => {
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const { isSuperAdmin } = useLdapGroups();

  const settingsMenuConfig = useAppConfigPageMenu();
  const userSettingsMenuConfig = useUserSettingsMenuConfig();
  const fileSharingMenuConfig = useFileSharingMenuConfig();
  const surveysMenuConfig = useSurveysPageMenu();
  const classManagementMenuConfig = useClassManagementMenu();
  const linuxmusterMenuConfig = useLinuxmusterMenu();
  const { sections } = useSubMenuStore();
  const { scrollToSection } = useScrollToSection();

  const menuBarConfigRegistry: Partial<Record<string, MenuBarEntry>> = useMemo(
    () => ({
      [APPS.FILE_SHARING]: fileSharingMenuConfig,
      [APPS.SURVEYS]: surveysMenuConfig,
      [APPS.CLASS_MANAGEMENT]: classManagementMenuConfig,
      [APPS.LINUXMUSTER]: linuxmusterMenuConfig,
      [USER_SETTINGS_PATH]: userSettingsMenuConfig,
      ...(isSuperAdmin ? { [SETTINGS_PATH]: settingsMenuConfig } : {}),
    }),
    [
      fileSharingMenuConfig,
      surveysMenuConfig,
      classManagementMenuConfig,
      linuxmusterMenuConfig,
      userSettingsMenuConfig,
      isSuperAdmin,
      settingsMenuConfig,
    ],
  );

  const sectionChildren: MenuItem[] = useMemo(
    () =>
      sections.map((section) => ({
        id: section.id,
        label: section.label,
        icon: '',
        action: section.action ?? (() => scrollToSection(section.id)),
        disableTranslation: true,
      })),
    [sections, scrollToSection],
  );

  const rootPathName = getFromPathName(pathname, 1);
  const configValues = menuBarConfigRegistry[rootPathName] ?? DISABLED_MENU_BAR_ENTRY;
  const activeMenuItemId = getFromPathName(pathname, 2);

  const getItemChildren = (itemId: string): MenuItem[] | undefined => {
    if (sectionChildren.length === 0) return undefined;
    if (itemId === activeMenuItemId) return sectionChildren;
    if (sectionChildren.some((c) => c.id === activeMenuItemId)) return sectionChildren;
    if (!activeMenuItemId) return sectionChildren;
    return undefined;
  };

  const menuItems: MenuItem[] = useMemo(
    () =>
      configValues.menuItems.map((item) => ({
        id: item.id,
        label: item.disableTranslation ? item.label : t(item.label),
        action: () => item.action(),
        icon: item.icon,
        disableTranslation: item.disableTranslation,
        children: getItemChildren(item.id),
      })),
    [configValues.menuItems, t, activeMenuItemId, sectionChildren],
  );

  return useMemo(
    () => ({
      menuItems,
      title: t(configValues.title),
      disabled: configValues.disabled,
      icon: configValues.icon,
      color: configValues.color,
      appName: configValues.appName,
      onHeaderClick: configValues.onHeaderClick,
    }),
    [
      menuItems,
      t,
      configValues.title,
      configValues.disabled,
      configValues.icon,
      configValues.color,
      configValues.appName,
      configValues.onHeaderClick,
    ],
  );
};

export default useMenuBarConfig;
