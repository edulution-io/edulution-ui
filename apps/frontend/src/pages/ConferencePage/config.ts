import { FileSharing, Desktop, Conferences } from '@/assets/icons';
import { MenuBarEntryProps } from '@/datatypes/types';

const CONFERENCES_MENUBAR_CONFIG: MenuBarEntryProps = {
  title: 'conferences.title',
  icon: Conferences,
  color: 'hover:bg-ciDarkBlue',
  menuItems: [
    {
      id: 'join',
      label: 'common.add',
      icon: FileSharing,
      action: () => {},
    },
    { id: 'reload', label: 'common.reload', icon: Desktop, action: () => {} },
  ],
};

export default CONFERENCES_MENUBAR_CONFIG;
