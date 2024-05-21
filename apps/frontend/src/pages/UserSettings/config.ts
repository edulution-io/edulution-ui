import { AntiMalwareIcon, UserIcon } from '@/assets/icons';
import { MenuBarEntryProps } from '@/datatypes/types';
import { Navigate } from 'react-router-dom';

const USERSETTINGS_MENUBAR_CONFIG: MenuBarEntryProps = {
  title: 'usersettings.title',
  icon: UserIcon,
  color: 'hover:bg-ciLightBlue',
  menuItems: [
    // {
    //   id: 'general',
    //   label: 'general',
    //   icon: UserIcon,
    //   action: () => {},
    // },
    {
      id: 'security',
      label: 'usersettings.security',
      icon: AntiMalwareIcon,
      action: () => {
        Navigate({ to: '/user/security' });
      },
    },
  ],
};

export default USERSETTINGS_MENUBAR_CONFIG;
