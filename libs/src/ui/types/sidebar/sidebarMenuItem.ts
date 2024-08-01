import { SidebarNotification } from '@libs/dashboard/types/sidebar-notification';

export type SidebarMenuItem = {
  title: string;
  link: string;
  icon: string;
  color: string;
  notifications?: SidebarNotification;
};
