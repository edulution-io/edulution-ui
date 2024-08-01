import { IconType } from 'react-icons';
import { FaStarOfLife } from 'react-icons/fa';
import { APPS } from '@libs/appconfig/types';

export interface SidebarNotification {
  show: boolean;
  icon: IconType;
  iconColor: string;
  iconSize?: number;
  count?: number;
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
export const EmptySidebarNotification: SidebarNotification = {
  show: false,
  iconColor: 'text-ciLightBlue',
  icon: FaStarOfLife,
  count: 0,
};

export type SidebarNotifications = Partial<Record<APPS, SidebarNotification>>;
