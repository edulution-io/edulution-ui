import { LernmanagementIcon } from '@/assets/icons';
import { MenuBarEntryProps } from '@/datatypes/types';

const useLearningManagementPageMenu = () => {
  const menuBar = (): MenuBarEntryProps => ({
    title: 'learningManagement.title',
    disabled: true,
    icon: LernmanagementIcon,
    color: '',
    menuItems: [],
  });

  return menuBar();
};

export default useLearningManagementPageMenu;
