import MenuBarEntry from '@libs/menubar/menuBarEntry';
import APPS from '@libs/appconfig/constants/apps';
import { BulletinBoardIcon } from '@/assets/icons';

const useBulletinBoardEditorialPageMenu = () => {
  const menuBar = (): MenuBarEntry => ({
    title: 'bulletinboard.title',
    appName: APPS.BULLETIN_BOARD,
    disabled: true,
    icon: BulletinBoardIcon,
    color: 'hover:bg-ciDarkBlue',
    menuItems: [],
  });
  return menuBar();
};

export default useBulletinBoardEditorialPageMenu;
