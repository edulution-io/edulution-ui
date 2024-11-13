import { PlusIcon, SettingsIcon } from '@/assets/icons';
import useAppConfigsStore from '@/pages/Settings/AppConfig/appConfigsStore';
import { findAppConfigByName } from '@/utils/common';
import { useNavigate } from 'react-router-dom';
import { APP_CONFIG_OPTIONS } from '@/pages/Settings/AppConfig/appConfigOptions';
import APPS from '@libs/appconfig/constants/apps';
import MenuBarEntryProps from '@libs/menubar/menuBarEntry';

const useAppConfigPageMenu = () => {
  const navigate = useNavigate();
  const { appConfigs, isAddAppConfigDialogOpen, setIsAddAppConfigDialogOpen } = useAppConfigsStore();

  const settingsMenuBarEntry: MenuBarEntryProps = {
    appName: APPS.SETTINGS,
    title: 'settings.title',
    icon: SettingsIcon,
    color: 'hover:bg-ciGreenToBlue',
    menuItems: [
      {
        id: 'add',
        label: 'common.add',
        icon: PlusIcon,
        action: () => {},
      },
    ],
  };

  const appConfigPageMenu = (): MenuBarEntryProps => ({
    ...settingsMenuBarEntry,
    menuItems: [
      ...APP_CONFIG_OPTIONS.filter((option) => findAppConfigByName(appConfigs, option.id) !== undefined).map(
        (item) => ({
          id: item.id,
          label: `${item.id}.sidebar`,
          icon: item.icon,
          action: () => navigate(`/settings/${item.id}`),
        }),
      ),
      ...settingsMenuBarEntry.menuItems.map((item) => ({
        ...item,
        action: () => setIsAddAppConfigDialogOpen(!isAddAppConfigDialogOpen),
      })),
    ],
  });

  return appConfigPageMenu();
};

export default useAppConfigPageMenu;
