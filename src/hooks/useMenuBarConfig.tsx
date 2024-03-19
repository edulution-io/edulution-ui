import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useLocalStorage } from 'usehooks-ts';

import { MenuItem, ConfigType, MenuBarEntryProps, APPS } from '@/datatypes/types';
import { SETTINGS_APPSELECT_OPTIONS } from '@/constants';
import FILESHARING_MENUBAR_CONFIG from '@/pages/FileSharing/config';
import CONFERENCES_MENUBAR_CONFIG from '@/pages/ConferencePage/config';
import ROOMBOOKING_MENUBAR_CONFIG from '@/pages/RoomBookingPage/config';
import SETTINGS_MENUBAR_CONFIG from '@/pages/Settings/config';

const useMenuBarConfig = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [, setSearchParams] = useSearchParams();
  const [config] = useLocalStorage<ConfigType>('edu-config', {});

  const settingsMenubarConfig = {
    ...SETTINGS_MENUBAR_CONFIG,
    menuItems: [
      ...SETTINGS_APPSELECT_OPTIONS.filter((option) => config[option.id] !== undefined).map((item) => ({
        id: item.id,
        label: `${item.id}.sidebar`,
        icon: item.icon,
        action: () => navigate(`/settings/${item.id}`),
      })),
      ...SETTINGS_MENUBAR_CONFIG.menuItems.map((items) => ({
        ...items,
        action: () => setSearchParams({ mode: 'add' }),
      })),
    ],
  };

  const menuBarConfigSwitch = () => {
    const rootPathName = `${location.pathname.split('/')[1]}`;

    if (rootPathName === 'settings') return settingsMenubarConfig;

    switch (rootPathName as APPS) {
      case APPS.FILE_SHARING: {
        return FILESHARING_MENUBAR_CONFIG;
      }
      case APPS.CONFERENCES: {
        return CONFERENCES_MENUBAR_CONFIG;
      }
      case APPS.ROOM_BOOKING: {
        return ROOMBOOKING_MENUBAR_CONFIG;
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
    icon: item.icon,
    action: () => item.action(),
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
