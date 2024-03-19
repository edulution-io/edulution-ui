import { FileSharingIcon, DesktopIcon, OneSourceIcon, EducationIcon } from '@/assets/icons';

const FILESHARING_MENUBAR_CONFIG = {
  title: 'fileSharing.title',
  icon: FileSharingIcon,
  color: 'hover:bg-ciDarkBlue',
  menuItems: [
    {
      label: 'home',
      link: '/file-sharing',
      icon: FileSharingIcon,
    },
    {
      label: 'programs',
      link: '/file-sharing/profile',
      icon: DesktopIcon,
    },
    {
      label: 'share',
      link: '/file-sharing/settings',
      icon: OneSourceIcon,
    },
    {
      label: 'students',
      link: '/',
      icon: EducationIcon,
    },
  ],
};

export default FILESHARING_MENUBAR_CONFIG;
