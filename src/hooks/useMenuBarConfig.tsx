import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLocalStorage } from 'usehooks-ts';

import MenuItem from '@/datatypes/types';
import { SETTINGS_APPSELECT_OPTIONS } from '@/constants';
import FILESHARING_MENUBAR_CONFIG from '@/pages/FileSharing/config';
import CONFERENCES_MENUBAR_CONFIG from '@/pages/ConferencePage/config';
import ROOMBOOKING_MENUBAR_CONFIG from '@/pages/RoomBookingPage/config';
import SETTINGS_MENUBAR_CONFIG from '@/pages/Settings/config';

const useMenuBarConfig = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [config] = useLocalStorage<ConfigType>('edu-config', {});

  type ConfigType = {
    [key: string]: { linkPath: string };
  };

  const settingsMenubarConfig = {
    ...SETTINGS_MENUBAR_CONFIG,
    menuItems: [
      ...SETTINGS_APPSELECT_OPTIONS.filter((option) => config[option.id] !== undefined).map((item) => ({
        label: `${item.id}.sidebar`,
        link: `/settings/${item.id}`,
        icon: item.icon,
      })),
      ...SETTINGS_MENUBAR_CONFIG.menuItems,
    ],
  };

  const menuBarConfigSwitch = () => {
    const rootPathName = `${location.pathname.split('/')[1]}`;

    switch (rootPathName) {
      case 'filesharing': {
        return FILESHARING_MENUBAR_CONFIG;
      }
      case 'conferences': {
        return CONFERENCES_MENUBAR_CONFIG;
      }
      case 'roombooking': {
        return ROOMBOOKING_MENUBAR_CONFIG;
      }
      case 'settings': {
        return settingsMenubarConfig;
      }
      default: {
        return { menuItems: [], title: '', icon: '', color: '' };
      }
    }
  };

  const configValues = menuBarConfigSwitch();

  const menuItems: MenuItem[] = configValues.menuItems.map((item) => ({
    label: t(item.label),
    action: () => navigate(item.link),
    icon: item.icon,
  }));

  interface MenuBarEntryProps {
    menuItems: MenuItem[];
    title: string;
    icon: string;
    color: string;
  }

  const menuBarEntries: MenuBarEntryProps = {
    menuItems,
    title: t(configValues.title),
    icon: configValues.icon,
    color: configValues.color,
  };

  return menuBarEntries;
};

export default useMenuBarConfig;
