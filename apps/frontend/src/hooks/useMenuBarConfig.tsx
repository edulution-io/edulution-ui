import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { APPS } from '@libs/appconfig/types';
import { getFromPathName } from '@libs/common/utils';
import { MenuBarEntryProps, MenuItem } from '@/datatypes/types';
import { USER_SETTINGS_PATH } from '@libs/userSettings/constants/user-settings-endpoints';
import useConferencesPageMenu from '@/pages/ConferencePage/useConferencesPageMenu';
import useAppConfigPageMenu from '@/pages/Settings/useAppConfigPageMenu';
import useUserSettingsMenuConfig from '@/pages/UserSettings/useUserSettingsMenu';
import DESKTOP_DEPLOYMENT_MENUBAR_CONFIG from '@/pages/DesktopDeployment/config';
import useSurveysPageMenu from '@/pages/Surveys/useSurveysPageMenu';
import useFileSharingMenuConfig from '@/pages/FileSharing/useMenuConfig';
import useMailPageMenu from '@/pages/Mail/useMailPageMenu';
import useLinuxmusterPageMenu from '@/pages/LinuxmusterPage/useLinuxmusterPageMenu';

const useMenuBarConfig = (): MenuBarEntryProps => {
  const { pathname } = useLocation();
  const { t } = useTranslation();

  const SETTINGS_MENU_CONFIG = useAppConfigPageMenu();
  const USERSETTINGS_MENUBAR_CONFIG = useUserSettingsMenuConfig();
  const FILE_SHARING_MENUBAR_CONFIG = useFileSharingMenuConfig();
  const CONFERENCES_MENUBAR_CONFIG = useConferencesPageMenu();
  const MAIL_MENUBAR_CONFIG = useMailPageMenu();
  const SURVEYS_MENUBAR_CONFIG = useSurveysPageMenu();
  const LINUXMUSTER_MENUBAR_CONFIG = useLinuxmusterPageMenu();

  const menuBarConfigSwitch = (): MenuBarEntryProps => {
    const rootPathName = getFromPathName(pathname, 1);

    if (rootPathName === 'settings') return SETTINGS_MENU_CONFIG;
    if (rootPathName === USER_SETTINGS_PATH) return USERSETTINGS_MENUBAR_CONFIG;

    switch (rootPathName as APPS) {
      case APPS.FILE_SHARING: {
        return FILE_SHARING_MENUBAR_CONFIG;
      }
      case APPS.CONFERENCES: {
        return CONFERENCES_MENUBAR_CONFIG;
      }
      case APPS.SURVEYS: {
        return SURVEYS_MENUBAR_CONFIG;
      }
      case APPS.MAIL: {
        return MAIL_MENUBAR_CONFIG;
      }
      case APPS.LINUXMUSTER: {
        return LINUXMUSTER_MENUBAR_CONFIG;
      }
      case APPS.DESKTOP_DEPLOYMENT: {
        return DESKTOP_DEPLOYMENT_MENUBAR_CONFIG;
      }
      default: {
        return { menuItems: [], title: '', icon: '', color: '', disabled: false };
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
  };
};

export default useMenuBarConfig;
