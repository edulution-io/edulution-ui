import { RoomBookingIcon } from '@/assets/icons';

const ROOMBOOKING_MENUBAR_CONFIG = {
  title: 'roomBooking.title',
  icon: RoomBookingIcon,
  color: 'hover:bg-ciLightBlue',
  menuItems: [
    {
      label: 'roomBooking.rooms',
      link: '/room-booking/rooms',
      icon: RoomBookingIcon,
    },
  ],
};

export default ROOMBOOKING_MENUBAR_CONFIG;
