import { useNavigate } from 'react-router-dom';
import { PlusIcon, SettingsIcon } from '@/assets/icons';
import { MenuBarEntryProps } from '@/datatypes/types';
import useAppConfigsStore from '@/pages/Settings/AppConfig/appConfigsStore';
import { findAppConfigByName } from '@/utils/common';
import { APP_CONFIG_OPTIONS } from '@/pages/Settings/AppConfig/appConfigOptions';

const useAppConfigPageMenu = () => {
  const navigate = useNavigate();
  const { appConfigs, isAddAppConfigDialogOpen, setIsAddAppConfigDialogOpen } = useAppConfigsStore();

  const settingsMenuBarEntry: MenuBarEntryProps = {
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
      ...APP_CONFIG_OPTIONS.filter((appConfig) => findAppConfigByName(appConfigs, appConfig.name) !== undefined).map(
        (item) => ({
          id: item.name,
          label: `${item.name}.sidebar`,
          icon: item.icon,
          action: () => navigate(`/settings/${item.name}`),
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
