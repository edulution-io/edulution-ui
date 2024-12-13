import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import APPS from '@libs/appconfig/constants/apps';
import { getFromPathName } from '@libs/common/utils';
import { USER_SETTINGS_PATH } from '@libs/userSettings/constants/user-settings-endpoints';
import useAppConfigPageMenu from '@/pages/Settings/useAppConfigPageMenu';
import useUserSettingsMenuConfig from '@/pages/UserSettings/useUserSettingsMenu';
import useSurveysPageMenu from '@/pages/Surveys/useSurveysPageMenu';
import useFileSharingMenuConfig from '@/pages/FileSharing/useMenuConfig';
import useClassManagementMenu from '@/pages/ClassManagement/useClassManagementMenu';
import type TApps from '@libs/appconfig/types/appsType';
import MenuBarEntry from '@libs/menubar/menuBarEntry';
import MenuItem from '@libs/menubar/menuItem';

const useMenuBarConfig = (): MenuBarEntry => {
  const { pathname } = useLocation();
  const { t } = useTranslation();

  const SETTINGS_MENU_CONFIG = useAppConfigPageMenu();
  const USERSETTINGS_MENUBAR_CONFIG = useUserSettingsMenuConfig();
  const FILE_SHARING_MENUBAR_CONFIG = useFileSharingMenuConfig();
  const SURVEYS_MENUBAR_CONFIG = useSurveysPageMenu();
  const CLASS_MANAGEMENT_MENUBAR_CONFIG = useClassManagementMenu();

  const menuBarConfigSwitch = (): MenuBarEntry => {
    const rootPathName = getFromPathName(pathname, 1);

    if (rootPathName === 'settings') return SETTINGS_MENU_CONFIG;
    if (rootPathName === USER_SETTINGS_PATH) return USERSETTINGS_MENUBAR_CONFIG;

    const defaultReturnMenuBarEntry = {
      menuItems: [],
      title: '',
      icon: '',
      color: '',
      disabled: true,
      appName: APPS.NONE,
    };

    switch (rootPathName as TApps) {
      case APPS.FILE_SHARING: {
        return FILE_SHARING_MENUBAR_CONFIG;
      }
      case APPS.SURVEYS: {
        return SURVEYS_MENUBAR_CONFIG;
      }
      case APPS.CLASS_MANAGEMENT: {
        return CLASS_MANAGEMENT_MENUBAR_CONFIG;
      }
      default: {
        return defaultReturnMenuBarEntry;
      }
    }
  };

  const configValues = menuBarConfigSwitch();
  const menuItems: MenuItem[] = configValues.menuItems.map((item) => ({
    id: item.id,
    label: t(item.label),
    action: () => item.action(),
    icon: item.icon,
  }));

  return {
    menuItems,
    title: t(configValues.title),
    disabled: configValues.disabled,
    icon: configValues.icon,
    color: configValues.color,
    appName: configValues.appName,
  };
};

export default useMenuBarConfig;
