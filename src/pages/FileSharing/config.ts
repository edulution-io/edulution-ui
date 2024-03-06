import { FileSharing, Desktop, Share, Students } from '@/assets/icons';

const FILESHARING_MENUBAR_CONFIG = {
  title: 'fileSharing.title',
  icon: FileSharing,
  color: 'hover:bg-ciDarkBlue',
  menuItems: [
    {
      label: 'home',
      link: '/filesharing',
      icon: FileSharing,
    },
    {
      label: 'programs',
      link: '/filesharing/profile',
      icon: Desktop,
    },
    {
      label: 'share',
      link: '/filesharing/settings',
      icon: Share,
    },
    {
      label: 'students',
      link: '/',
      icon: Students,
    },
  ],
};

export default FILESHARING_MENUBAR_CONFIG;
