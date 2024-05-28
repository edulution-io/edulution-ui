import { ConferencesIcon, VideoConferenceIcon } from '@/assets/icons';
import { MenuBarEntryProps } from '@/datatypes/types';

const useConferencesPageMenu = () => {
  const menuBar = (): MenuBarEntryProps => ({
    title: 'conferences.title',
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
