import { AntiMalwareIcon, UserIcon } from '@/assets/icons';
import { MenuBarEntryProps } from '@/datatypes/types';

const USERSETTINGS_MENUBAR_CONFIG: MenuBarEntryProps = {
  title: 'usersettings.title',
  icon: UserIcon,
  color: 'hover:bg-ciLightBlue',
  menuItems: [
    {
      id: 'security',
      label: 'usersettings.security',
      icon: AntiMalwareIcon,
      action: () => {},
    },
  ],
};

export default USERSETTINGS_MENUBAR_CONFIG;
