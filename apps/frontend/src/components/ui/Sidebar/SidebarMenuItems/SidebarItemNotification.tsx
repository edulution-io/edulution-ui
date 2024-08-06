import React from 'react';
import { FaStarOfLife } from 'react-icons/fa';

interface SidebarItemNotificationProps {
  notificationCounter?: number;
}

const SidebarItemNotification = (props: SidebarItemNotificationProps) => {
  const { notificationCounter } = props;

  if (!notificationCounter || notificationCounter === 0) {
    return null;
  }

  return (
    <FaStarOfLife
      size={12}
      className="absolute right-1 top-1 text-ciLightGreen"
    />
  );
};

export default SidebarItemNotification;
