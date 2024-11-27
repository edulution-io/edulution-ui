import { PlusIcon, SettingsIcon } from '@/assets/icons';
import useAppConfigsStore from '@/pages/Settings/AppConfig/appConfigsStore';
import { useNavigate } from 'react-router-dom';
import { APP_CONFIG_OPTIONS } from '@/pages/Settings/AppConfig/appConfigOptions';
import findAppConfigByName from '@libs/common/utils/findAppConfigByName';
import APPS from '@libs/appconfig/constants/apps';
import MenuBarEntry from '@libs/menubar/menuBarEntry';

const useAppConfigPageMenu = () => {
  const navigate = useNavigate();
  const { appConfigs, isAddAppConfigDialogOpen, setIsAddAppConfigDialogOpen } = useAppConfigsStore();

  const settingsMenuBarEntry: MenuBarEntry = {
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

  const appConfigPageMenu = (): MenuBarEntry => ({
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
