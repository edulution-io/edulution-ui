import { Settings, PlusIcon } from '@/assets/icons';

const SETTINGS_MENUBAR_CONFIG = {
  title: 'settings.title',
  icon: Settings,
  color: 'hover:bg-ciGreenToBlue',
  menuItems: [
    {
      id: 'add',
      label: 'common.add',
      link: '?mode=add',
      icon: PlusIcon,
    },
  ],
};

export default SETTINGS_MENUBAR_CONFIG;
