import { license01, license02 } from '@/assets/icons';
import { MenuBarEntryProps } from '@/datatypes/types';

const useLicenseInfoPageMenu = () => {
  const menuBar = (): MenuBarEntryProps => ({
    title: 'licensing.title',
    disabled: true,
    icon: license01,
    color: 'hover:bg-ciDarkBlue',
    menuItems: [
      {
        id: 'overview',
        label: 'common.overview',
        icon: license02,
        action: () => {},
      },
    ],
  });

  return menuBar();
};

export default useLicenseInfoPageMenu;
