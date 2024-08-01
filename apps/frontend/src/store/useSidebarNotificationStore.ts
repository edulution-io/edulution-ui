import { create } from 'zustand';
import { APPS } from '@libs/appconfig/types';
import {
  EmptySidebarNotification,
  SidebarNotification,
  SidebarNotifications,
} from '@libs/dashboard/types/sidebar-notification';

interface SidebarNotificationStore {
  reset: () => void;
  notifications: SidebarNotifications;
  getAppData: (app: APPS) => SidebarNotification | undefined;
  updateAppData: (app: APPS, notification: SidebarNotification) => void;
  resetAppData: (app: APPS) => void;
}

const initialState: Partial<SidebarNotificationStore> = {
  notifications: {
    [APPS.MAIL]: EmptySidebarNotification,
    [APPS.CONFERENCES]: EmptySidebarNotification,
  },
};

const useSidebarNotificationStore = create<SidebarNotificationStore>((set, get) => ({
  ...(initialState as SidebarNotificationStore),
  reset: () => set(initialState),
  getAppData: (app: APPS) => {
    const { notifications } = get();
    return notifications[app];
  },
  updateAppData: (app: APPS, notification: SidebarNotification) => {
    const { notifications } = get();
    const alteredNotificationState = {
      ...notifications,
      [app]: {
        ...notification,
      },
    };
    set({ notifications: alteredNotificationState });
  },
  resetAppData: (app: APPS) => {
    const { notifications } = get();
    const alteredNotificationState = { ...notifications, [app]: EmptySidebarNotification };
    set({ notifications: alteredNotificationState });
  },
}));

export default useSidebarNotificationStore;
