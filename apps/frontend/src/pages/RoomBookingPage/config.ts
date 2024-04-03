import { RoomBookingIcon } from '@/assets/icons';
import { MenuBarEntryProps } from '@/datatypes/types';

const ROOMBOOKING_MENUBAR_CONFIG: MenuBarEntryProps = {
  title: 'roombooking.title',
  icon: RoomBookingIcon,
  color: 'hover:bg-ciLightBlue',
  menuItems: [
    {
      id: 'rooms',
      label: 'roombooking.rooms',
      icon: RoomBookingIcon,
      action: () => {},
    },
  ],
};

export default ROOMBOOKING_MENUBAR_CONFIG;
