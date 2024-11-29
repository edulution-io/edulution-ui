import MenuBarEntry from '@libs/menubar/menuBarEntry';
import APPS from '@libs/appconfig/constants/apps';
import { WhiteBoardIcon } from '@/assets/icons';

const useBulletinBoardPageMenu = () => {
  const menuBar = (): MenuBarEntry => ({
    title: 'bulletinboard.title',
    appName: APPS.BULLETIN_BOARD,
    disabled: true,
    icon: WhiteBoardIcon,
    color: 'hover:bg-ciDarkBlue',
    menuItems: [],
  });
  return menuBar();
};

export default useBulletinBoardPageMenu;
