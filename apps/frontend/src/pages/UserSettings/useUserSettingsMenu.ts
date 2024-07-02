import { SecurityIcon, UserIcon } from '@/assets/icons';
import { MenuBarEntryProps } from '@/datatypes/types';
import { useSearchParams } from 'react-router-dom';

const useUserSettingsMenu = () => {
  const [, setSearchParams] = useSearchParams();

  const USERSETTINGS_MENUBAR_CONFIG: MenuBarEntryProps = {
    title: 'usersettings.title',
    icon: UserIcon,
    color: 'hover:bg-ciGreenToBlue',
    menuItems: [
      {
        id: 'security',
        label: 'usersettings.security.title',
        icon: SecurityIcon,
        action: () => setSearchParams({ section: 'security' }),
      },
    ],
  };

  return USERSETTINGS_MENUBAR_CONFIG;
};

export default useUserSettingsMenu;
