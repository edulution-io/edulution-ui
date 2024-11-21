import { PlusIcon, SettingsIcon } from '@/assets/icons';
import { MenuBarEntryProps } from '@/datatypes/types';
import useAppConfigsStore from '@/pages/Settings/AppConfig/appConfigsStore';
import { useNavigate } from 'react-router-dom';
import { APP_CONFIG_OPTIONS } from '@/pages/Settings/AppConfig/appConfigOptions';
import findAppConfigByName from '@libs/common/utils/findAppConfigByName';

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
