import { LinuxmusterIcon } from '@/assets/icons';
import MenuBarEntryProps from '@libs/menubar/menuBarEntry';
import APPS from '@libs/appconfig/constants/apps';

const useLinuxmusterPageMenu = () => {
  const menuBar = (): MenuBarEntryProps => ({
    title: 'linuxmuster.title',
    appName: APPS.LINUXMUSTER,
    disabled: true,
    icon: LinuxmusterIcon,
    color: '',
    menuItems: [],
  });

  return menuBar();
};

export default useLinuxmusterPageMenu;
