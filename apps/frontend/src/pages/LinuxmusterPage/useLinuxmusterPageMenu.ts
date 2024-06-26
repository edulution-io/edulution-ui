import { LinuxmusterIcon } from '@/assets/icons';
import { MenuBarEntryProps } from '@/datatypes/types';

const useLinuxmusterPageMenu = () => {
  const menuBar = (): MenuBarEntryProps => ({
    title: 'linuxmuster.title',
    disabled: true,
    icon: LinuxmusterIcon,
    color: '',
    menuItems: [],
  });

  return menuBar();
};

export default useLinuxmusterPageMenu;
