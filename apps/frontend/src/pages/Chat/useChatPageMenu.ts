import { ChatIcon } from '@/assets/icons';
import { MenuBarEntryProps } from '@/datatypes/types';

const useChatPageMenu = () => {
  const menuBar = (): MenuBarEntryProps => ({
    title: 'chat.title',
    disabled: true,
    icon: ChatIcon,
    color: '',
    menuItems: [],
  });

  return menuBar();
};

export default useChatPageMenu;
