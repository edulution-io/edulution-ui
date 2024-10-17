import { TicketSystemIcon } from '@/assets/icons';
import { MenuBarEntryProps } from '@/datatypes/types';

const useTicketSystemPageMenu = () => {
  const menuBar = (): MenuBarEntryProps => ({
    title: 'ticketSystem.title',
    disabled: true,
    icon: TicketSystemIcon,
    color: '',
    menuItems: [],
  });

  return menuBar();
};

export default useTicketSystemPageMenu;
