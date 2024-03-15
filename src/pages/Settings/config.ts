import { Settings, PlusIcon } from '@/assets/icons';
import { MenuBarEntryProps } from '@/datatypes/types';

const SETTINGS_MENUBAR_CONFIG: MenuBarEntryProps = {
  title: 'settings.title',
  icon: Settings,
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

export default SETTINGS_MENUBAR_CONFIG;
