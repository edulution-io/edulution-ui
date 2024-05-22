import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { APPS, MenuBarEntryProps, MenuItem } from '@/datatypes/types';
import useConferencesPageMenu from '@/pages/ConferencePage/useConferencesPageMenu';
import ROOMBOOKING_MENUBAR_CONFIG from '@/pages/RoomBookingPage/config';
import USERSETTINGS_MENUBAR_CONFIG from '@/pages/UserSettings/config';
import useFileSharingMenuConfig from '@/pages/FileSharing/useMenuConfig';
import useSettingsMenuConfig from '@/pages/Settings/config';
import { getFromPathName } from '@/utils/common';
import useSchoolManagementPageMenu from '@/pages/SchoolmanagementPage/useSchoolManagementPageMenu';
import useSurveysPageMenu from '@/pages/Survey/useSurveyPageMenu';

const useMenuBarConfig = () => {
  const { pathname } = useLocation();
  const { t } = useTranslation();

  const SETTINGS_MENU_CONFIG = useSettingsMenuConfig();
  const FILE_SHARING_MENUBAR_CONFIG = useFileSharingMenuConfig();
  const CONFERENCES_MENUBAR_CONFIG = useConferencesPageMenu();
  const SCHOOLMANAGEMENT_MENUBAR_CONFIG = useSchoolManagementPageMenu();
  const SURVEYS_MENUBAR_CONFIG = useSurveysPageMenu();

  const menuBarConfigSwitch = () => {
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
      default: {
        return { menuItems: [], title: '', icon: '', color: '' };
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
    icon: configValues.icon,
    color: configValues.color,
  };

  return menuBarEntries;
};

export default useMenuBarConfig;
