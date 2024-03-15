import { FileSharing, Desktop, Share, Students } from '@/assets/icons';
import { MenuBarEntryProps } from '@/datatypes/types';

const FILESHARING_MENUBAR_CONFIG: MenuBarEntryProps = {
  title: 'filesharing.title',
  icon: FileSharing,
  color: 'hover:bg-ciDarkBlue',
  menuItems: [
    { id: 'home', label: 'home', icon: FileSharing, action: () => {} },
    {
      id: 'programs',
      label: 'programs',
      icon: Desktop,
      action: () => {},
    },
    {
      id: 'share',
      label: 'share',
      icon: Share,
      action: () => {},
    },
    {
      id: 'students',
      label: 'students',
      icon: Students,
      action: () => {},
    },
  ],
};

export default FILESHARING_MENUBAR_CONFIG;
