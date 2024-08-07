import { SecurityIcon, UserIcon } from '@/assets/icons';
import { MenuBarEntryProps } from '@/datatypes/types';
import { useNavigate } from 'react-router-dom';
import { USER_SETTINGS_SECURITY_PATH } from '@libs/userSettings/constants/user-settings-endpoints';

const useUserSettingsMenu = () => {
  const navigate = useNavigate();

  const USERSETTINGS_MENUBAR_CONFIG: MenuBarEntryProps = {
    title: 'usersettings.title',
    icon: UserIcon,
    color: 'hover:bg-ciGreenToBlue',
    menuItems: [
      {
        id: 'security',
        label: 'usersettings.security.title',
        icon: SecurityIcon,
        action: () => navigate(USER_SETTINGS_SECURITY_PATH),
      },
    ],
  };

  return USERSETTINGS_MENUBAR_CONFIG;
};

export default useUserSettingsMenu;
