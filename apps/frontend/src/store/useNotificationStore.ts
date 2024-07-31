import { create } from 'zustand';
import { APPS } from '@libs/appconfig/types';

interface Notification {
  active: boolean;
  count?: number;
  message?: string;
}
const EmptyNotification: Notification = { active: false, count: 0, message: '' };

type Notifications = Partial<Record<APPS, Notification>>;

interface NotificationStore {
  reset: () => void;
  notifications: Notifications;
  getAppData: (app: APPS) => Notification | undefined;
  updateAppData: (app: APPS, notification: Notification) => void;
  resetAppData: (app: APPS) => void;
}

const initialState: Partial<NotificationStore> = {
  notifications: {
    [APPS.MAIL]: EmptyNotification,
  },
};

const useNotificationStore = create<NotificationStore>((set, get) => ({
  ...(initialState as NotificationStore),
  reset: () => set(initialState),
  getAppData: (app: APPS) => {
    const { notifications } = get();
    return notifications[app];
  },
  updateAppData: (app: APPS, notification: Notification) => {
    const { notifications } = get();
    set({
      notifications: {
        ...notifications,
        [app]: {
          active: notification.active,
          count: notification.count,
          message: notification.message,
        }  } })
  },
  resetAppData: (app: APPS) => {
    const { notifications } = get();
    set({ notifications: { ...notifications, [app]: EmptyNotification } })
  },
}));

export default useNotificationStore;
