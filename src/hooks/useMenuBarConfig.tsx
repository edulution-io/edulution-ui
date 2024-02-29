import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import MenuItem from '@/datatypes/types';
import FILESHARING_MENUBAR_CONFIG from '@/pages/FileSharing/config';
import CONFERENCES_MENUBAR_CONFIG from '@/pages/ConferencePage/config';
import ROOMBOOKING_MENUBAR_CONFIG from '@/pages/RoomBookingPage/config';

const useMenuBarConfig = (location: string) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const menuBarConfigSwitch = () => {
    switch (location) {
      case '/file-sharing': {
        return FILESHARING_MENUBAR_CONFIG;
      }
      case '/conferences': {
        return CONFERENCES_MENUBAR_CONFIG;
      }
      case '/room-booking': {
        return ROOMBOOKING_MENUBAR_CONFIG;
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
