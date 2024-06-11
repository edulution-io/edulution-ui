import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { APPS, MenuBarEntryProps, MenuItem } from '@/datatypes/types';
import useConferencesPageMenu from '@/pages/ConferencePage/useConferencesPageMenu';
import ROOMBOOKING_MENUBAR_CONFIG from '@/pages/RoomBookingPage/config';
import DESKTOP_DEPLOYMENT_MENUBAR_CONFIG from '@/pages/DesktopDeployment/config';
import useFileSharingMenuConfig from '@/pages/FileSharing/useMenuConfig';
import useSettingsMenuConfig from '@/pages/Settings/config';
import { getFromPathName } from '@/utils/common';
import useSchoolManagementPageMenu from '@/pages/SchoolmanagementPage/useSchoolManagementPageMenu';
import useMailPageMenu from '@/pages/Mail/useMailPageMenu';
import useSurveysPageMenu from '@/pages/Surveys/useSurveysPageMenu';
import useUserSettingsMenuConfig from '@/pages/UserSettings/useMenuConfig.ts';
import useLinuxmusterPageMenu from '@/pages/Linuxmuster/useLinuxmusterPageMenu';

const useMenuBarConfig = (): MenuBarEntryProps => {
  const { pathname } = useLocation();
  const { t } = useTranslation();

  const SETTINGS_MENU_CONFIG = useSettingsMenuConfig();
  const FILE_SHARING_MENUBAR_CONFIG = useFileSharingMenuConfig();
  const CONFERENCES_MENUBAR_CONFIG = useConferencesPageMenu();
  const MAIL_MENUBAR_CONFIG = useMailPageMenu();
  const SCHOOLMANAGEMENT_MENUBAR_CONFIG = useSchoolManagementPageMenu();
  const SURVEYS_MENUBAR_CONFIG = useSurveysPageMenu();
  const NEW_SURVEYS_MENUBAR_CONFIG = useSurveysPageMenu();
  const USERSETTINGS_MENUBAR_CONFIG = useUserSettingsMenuConfig();
  const LINUXMUSTER_MENUBAR_CONFIG = useLinuxmusterPageMenu();

  const menuBarConfigSwitch = (): MenuBarEntryProps => {
    const rootPathName = getFromPathName(pathname, 1);

    if (rootPathName === 'settings') return SETTINGS_MENU_CONFIG;
    if (rootPathName === 'user') return USERSETTINGS_MENUBAR_CONFIG;

    switch (rootPathName as APPS) {
      case APPS.FILE_SHARING: {
        return FILE_SHARING_MENUBAR_CONFIG;
      }
      case APPS.CONFERENCES: {
        return CONFERENCES_MENUBAR_CONFIG;
      }
      case APPS.ROOM_BOOKING: {
        return ROOMBOOKING_MENUBAR_CONFIG;
      }
      case APPS.SCHOOL_MANAGEMENT: {
        return SCHOOLMANAGEMENT_MENUBAR_CONFIG;
      }
      case APPS.SURVEYS: {
        return SURVEYS_MENUBAR_CONFIG;
      }
      case APPS.NEW_SURVEYS: {
        return NEW_SURVEYS_MENUBAR_CONFIG;
      }
      case APPS.MAIL: {
        return MAIL_MENUBAR_CONFIG;
      }
      case APPS.DESKTOP_DEPLOYMENT: {
        return DESKTOP_DEPLOYMENT_MENUBAR_CONFIG;
      }
      case APPS.LINUXMUSTER: {
        return LINUXMUSTER_MENUBAR_CONFIG;
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

  const menuBarEntries: MenuBarEntryProps = {
    menuItems,
    title: t(configValues.title),
    disabled: configValues.disabled,
    icon: configValues.icon,
    color: configValues.color,
  };

  return menuBarEntries;
};

export default useMenuBarConfig;
