import { FileSharing, Desktop, Conferences } from '@/assets/icons';

const CONFERENCES_MENUBAR_CONFIG = {
  title: 'conferences.title',
  icon: Conferences,
  color: 'hover:bg-ciDarkBlue',
  menuItems: [
    {
      id: 'add',
      label: 'common.add',
      link: '/conferences',
      icon: FileSharing,
    },
    { id: 'reload', label: 'common.reload', link: '/', icon: Desktop },
  ],
};

export default CONFERENCES_MENUBAR_CONFIG;
