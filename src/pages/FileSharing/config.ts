import { FileSharing, Desktop, Share, Students } from '@/assets/icons';

const FILESHARING_MENUBAR_CONFIG = {
  title: 'filesharing.title',
  icon: FileSharing,
  color: 'hover:bg-ciDarkBlue',
  menuItems: [
    { id: 'home', label: 'home', link: '/filesharing', icon: FileSharing },
    {
      id: 'programs',
      label: 'programs',
      link: '/filesharing/profile',
      icon: Desktop,
    },
    {
      id: 'share',
      label: 'share',
      link: '/filesharing/settings',
      icon: Share,
    },
    {
      id: 'students',
      label: 'students',
      link: '/',
      icon: Students,
    },
  ],
};

export default FILESHARING_MENUBAR_CONFIG;
