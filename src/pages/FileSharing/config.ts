import { FileSharing, Desktop, Share, Students } from '@/assets/icons';

const FILESHARING_MENUBAR_CONFIG = {
  title: 'fileSharing.title',
  icon: FileSharing,
  color: 'bg-ciDarkBlue',
  menuItems: [
    {
      label: 'home',
      link: '/file-sharing',
      icon: FileSharing,
    },
    {
      label: 'programs',
      link: '/file-sharing/profile',
      icon: Desktop,
    },
    {
      label: 'share',
      link: '/file-sharing/settings',
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
