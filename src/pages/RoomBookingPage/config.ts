import { RoomBooking } from '@/assets/icons';

const ROOMBOOKING_MENUBAR_CONFIG = {
  title: 'roombooking.title',
  icon: RoomBooking,
  color: 'hover:bg-ciLightBlue',
  menuItems: [
    {
      id: 'rooms',
      label: 'roombooking.rooms',
      link: '/roombooking/rooms',
      icon: RoomBooking,
    },
  ],
};

export default ROOMBOOKING_MENUBAR_CONFIG;
