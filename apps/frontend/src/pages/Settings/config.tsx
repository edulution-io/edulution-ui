import { SettingsIcon, PlusIcon } from '@/assets/icons';
import { SETTINGS_APPSELECT_OPTIONS } from '@/constants/settings';
import { MenuBarEntryProps } from '@/datatypes/types';
import useAppConfigsStore from '@/store/appConfigsStore';
import { findAppConfigByName } from '@/utils/common';
import { useNavigate, useSearchParams } from 'react-router-dom';

const useSettingsMenuConfig = () => {
  const navigate = useNavigate();
  const [, setSearchParams] = useSearchParams();
  const { appConfig } = useAppConfigsStore();

  const SETTINGS_CONFIG: MenuBarEntryProps = {
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

  const settignsMenuConfig = (): MenuBarEntryProps => ({
    ...SETTINGS_CONFIG,
    menuItems: [
      ...SETTINGS_APPSELECT_OPTIONS.filter((option) => findAppConfigByName(appConfig, option.id) !== undefined).map(
        (item) => ({
          id: item.id,
          label: `${item.id}.sidebar`,
          icon: item.icon,
          action: () => navigate(`/settings/${item.id}`),
        }),
      ),
      ...SETTINGS_CONFIG.menuItems.map((items) => ({
        ...items,
        action: () => setSearchParams({ mode: 'add' }),
      })),
    ],
  });

  return settignsMenuConfig();
};

export default useSettingsMenuConfig;
