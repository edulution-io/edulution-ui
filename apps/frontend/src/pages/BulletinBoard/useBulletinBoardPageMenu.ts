import MenuBarEntry from '@libs/menubar/menuBarEntry';
import APPS from '@libs/appconfig/constants/apps';
import { WhiteBoardIcon } from '@/assets/icons';

const useBulletinBoardPageMenu = () => {
  const menuBar = (): MenuBarEntry => ({
    title: 'bulletinboard.title',
    appName: APPS.BULLETIN_BOARD,
    disabled: false,
    icon: WhiteBoardIcon,
    color: 'hover:bg-ciDarkBlue',
    menuItems: [
      {
        id: 'overview',
        label: 'common.overview',
        icon: WhiteBoardIcon,
        action: () => {},
      },
    ],
  });
  return menuBar();
};

export default useBulletinBoardPageMenu;
