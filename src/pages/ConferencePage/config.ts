import { FileSharing, Desktop, Conferences } from '@/assets/icons';

const CONFERENCES_MENUBAR_CONFIG = {
  title: 'conferences.title',
  icon: Conferences,
  color: 'hover:bg-ciDarkBlue',
  menuItems: [
    {
      label: 'common.add',
      link: '/conferences',
      icon: FileSharing,
    },
    {
      label: 'common.reload',
      link: '/',
      icon: Desktop,
    },
  ],
};

export default CONFERENCES_MENUBAR_CONFIG;
