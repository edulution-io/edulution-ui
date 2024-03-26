import { FileSharingIcon, DesktopIcon, ConferencesIcon } from '@/assets/icons';

const CONFERENCES_MENUBAR_CONFIG = {
  title: 'conferences.title',
  icon: ConferencesIcon,
  color: 'hover:bg-ciDarkBlue',
  menuItems: [
    {
      label: 'common.add',
      link: '/conferences',
      icon: FileSharingIcon,
    },
    {
      label: 'common.reload',
      link: '/',
      icon: DesktopIcon,
    },
  ],
};

export default CONFERENCES_MENUBAR_CONFIG;
