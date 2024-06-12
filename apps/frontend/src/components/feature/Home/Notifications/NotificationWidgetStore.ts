import { create } from 'zustand';
import eduApi from '@/api/eduApi';
import Mail from '@/components/feature/Home/Notifications/components/types/mail.ts';
import mockedMails from '@/components/feature/Home/Notifications/components/mocked-values/mocked-mails.ts';
import NOTIFICATION_ENDPOINT from "@/components/feature/Home/Notifications/components/types/notification-endpoint.ts";

interface NotificationStore {
  lastUpdated: number | undefined;
  setLastUpdated: (date: number | undefined) => void;

  mails: Mail[];
  isFetchingMails: boolean;
  errorFetchingMails: Error | null;
  fetchMails: () => Promise<Mail[]>;

  reset: () => void;
}

const initialState: Partial<NotificationStore> = {
  lastUpdated: undefined,
  mails: [],
  isFetchingMails: false,
  errorFetchingMails: null,
};

const useNotificationStore = create<NotificationStore>((set) => ({
  ...(initialState as NotificationStore),
  setLastUpdated: (lastUpdated: number | undefined) => set({ lastUpdated }),

  fetchMails: async (): Promise<Mail[]> => {
    set({ errorFetchingMails: null, isFetchingMails: true });
    try {
      const response = await eduApi.get<Mail[]>(NOTIFICATION_ENDPOINT + 'mails/');
      const mails = response.data;
      set({ mails: mails || mockedMails, isFetchingMails: false });
      return mails;
    } catch (error) {
      set({ errorFetchingMails: error, isFetchingMails: false });
      return mockedMails;
    }
  },

  reset: () => set(initialState),
}));

export default useNotificationStore;
