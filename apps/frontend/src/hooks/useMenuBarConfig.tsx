import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { FileSharing } from '@/assets/icons';
import MenuItem from '@/datatypes/types';
import CONFERENCES_MENUBAR_CONFIG from '@/pages/ConferencePage/config';
import ROOMBOOKING_MENUBAR_CONFIG from '@/pages/RoomBookingPage/config';
import useMenuItems from '@/pages/FileSharing/useMenuConfig';
import useFileManagerStore from '@/store/fileManagerStore';

const useMenuBarConfig = (location: string) => {
  const { fetchFiles } = useFileManagerStore();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const fileSharingMenuItems = useMenuItems();
  const menuBarConfigSwitch = () => {
    switch (location) {
      case '/file-sharing': {
        return {
          menuItems: fileSharingMenuItems,
          title: 'File Sharing',
          icon: FileSharing,
          color: 'hover:bg-ciDarkBlue',
          action: () => fileSharingMenuItems[0].action(),
        };
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
  const { pathname } = useLocation();
  const menuItems: MenuItem[] = configValues.menuItems.map((item) => ({
    label: t(item.label),
    action: () => {
      if (pathname === '/file-sharing') {
        if ('path' in item) {
          return fetchFiles(item.path);
        }
      }
      navigate(item.label);
      return undefined;
    },

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
