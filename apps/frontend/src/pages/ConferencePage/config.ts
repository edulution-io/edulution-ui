import { DesktopIcon, ConferencesIcon, FileSharingIcon } from '@/assets/icons';
import { MenuBarEntryProps } from '@/datatypes/types';

const CONFERENCES_MENUBAR_CONFIG: MenuBarEntryProps = {
  title: 'conferences.title',
  icon: ConferencesIcon,
  color: 'hover:bg-ciDarkBlue',
  menuItems: [
    {
      id: 'join',
      label: 'common.add',
      icon: FileSharingIcon,
      action: () => {},
    },
    { id: 'reload', label: 'common.reload', icon: DesktopIcon, action: () => {} },
  ],
};

export default CONFERENCES_MENUBAR_CONFIG;
