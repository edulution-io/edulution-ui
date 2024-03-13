import { RoomBooking } from '@/assets/icons';

const ROOMBOOKING_MENUBAR_CONFIG = {
  title: 'roomBooking.title',
  icon: RoomBooking,
  color: 'hover:bg-ciLightBlue',
  menuItems: [
    {
      label: 'roomBooking.rooms',
      link: '/room-booking/rooms',
      icon: RoomBooking,
    },
  ],
};

export default ROOMBOOKING_MENUBAR_CONFIG;
