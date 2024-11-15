import { LinuxmusterIcon } from '@/assets/icons';
import MenuBarEntry from '@libs/menubar/menuBarEntry';
import APPS from '@libs/appconfig/constants/apps';

const useLinuxmusterPageMenu = () => {
  const menuBar = (): MenuBarEntry => ({
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
