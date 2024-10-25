import { MailIcon } from '@/assets/icons';
import { MenuBarEntryProps } from '@/datatypes/types';

const useMailPageMenu = () => {
  const menuBar = (): MenuBarEntryProps => ({
    title: 'mail.title',
    disabled: true,
    icon: MailIcon,
    color: '',
    menuItems: [],
  });

  return menuBar();
};

export default useMailPageMenu;
