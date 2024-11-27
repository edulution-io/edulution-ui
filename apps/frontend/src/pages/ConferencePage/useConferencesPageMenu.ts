import { ConferencesIcon, VideoConferenceIcon } from '@/assets/icons';
import MenuBarEntry from '@libs/menubar/menuBarEntry';
import APPS from '@libs/appconfig/constants/apps';

const useConferencesPageMenu = () => {
  const menuBar = (): MenuBarEntry => ({
    title: 'conferences.title',
    appName: APPS.CONFERENCES,
    disabled: true,
    icon: ConferencesIcon,
    color: 'hover:bg-ciDarkBlue',
    menuItems: [
      {
        id: 'overview',
        label: 'common.overview',
        icon: VideoConferenceIcon,
        action: () => {},
      },
    ],
  });

  return menuBar();
};

export default useConferencesPageMenu;
