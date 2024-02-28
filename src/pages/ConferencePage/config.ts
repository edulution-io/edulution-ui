import { FileSharing, Desktop, Conferences } from '@/assets/icons';

const CONFERENCES_MENUBAR_CONFIG = {
  title: 'conferences',
  icon: Conferences,
  color: 'bg-ciDarkBlue',
  menuItems: [
    {
      label: 'common.add',
      link: '/file-sharing',
      icon: FileSharing,
    },
    {
      label: 'common.reload',
      link: '/file-sharing/profile',
      icon: Desktop,
    },
  ],
};

export default CONFERENCES_MENUBAR_CONFIG;
