import {
  LanguageIcon,
  MailIcon,
  MobileDevicesIcon,
  SecurityIcon,
  UserDetailsSettingsIcon,
  SettingsIcon,
} from '@/assets/icons';
import { useNavigate } from 'react-router-dom';
import {
  USER_SETTINGS_LANGUAGE_PATH,
  USER_SETTINGS_MAILS_PATH,
  USER_SETTINGS_MOBILE_ACCESS_PATH,
  USER_SETTINGS_SECURITY_PATH,
  USER_SETTINGS_USER_DETAILS_PATH,
} from '@libs/userSettings/constants/user-settings-endpoints';
import MenuBarEntry from '@libs/menubar/menuBarEntry';
import APPS from '@libs/appconfig/constants/apps';

const useUserSettingsMenu = () => {
  const navigate = useNavigate();

  const USERSETTINGS_MENUBAR_CONFIG: MenuBarEntry = {
    appName: APPS.USER_SETTINGS,
    title: 'usersettings.title',
    icon: SettingsIcon,
    color: 'hover:bg-ciGreenToBlue',
    menuItems: [
      {
        id: 'security',
        label: 'usersettings.security.title',
        icon: SecurityIcon,
        action: () => navigate(USER_SETTINGS_SECURITY_PATH),
      },
      {
        id: 'details',
        label: 'usersettings.details.title',
        icon: UserDetailsSettingsIcon,
        action: () => navigate(USER_SETTINGS_USER_DETAILS_PATH),
      },
      {
        id: 'mails',
        label: 'usersettings.mails.title',
        icon: MailIcon,
        action: () => navigate(USER_SETTINGS_MAILS_PATH),
      },
      {
        id: 'language',
        label: 'usersettings.language.title',
        icon: LanguageIcon,
        action: () => navigate(USER_SETTINGS_LANGUAGE_PATH),
      },
      {
        id: 'mobileAccess',
        label: 'usersettings.mobileAccess.title',
        icon: MobileDevicesIcon,
        action: () => navigate(USER_SETTINGS_MOBILE_ACCESS_PATH),
      },
    ],
  };

  return USERSETTINGS_MENUBAR_CONFIG;
};

export default useUserSettingsMenu;
