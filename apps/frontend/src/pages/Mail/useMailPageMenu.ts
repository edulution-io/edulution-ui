import { MailIcon } from '@/assets/icons';
import MenuBarEntryProps from '@libs/menubar/menuBarEntry';
import APPS from '@libs/appconfig/constants/apps';

const useMailPageMenu = () => {
  const menuBar = (): MenuBarEntryProps => ({
    title: 'mail.title',
    disabled: true,
    icon: MailIcon,
    color: '',
    menuItems: [],
    appName: APPS.MAIL,
  });

  return menuBar();
};

export default useMailPageMenu;
