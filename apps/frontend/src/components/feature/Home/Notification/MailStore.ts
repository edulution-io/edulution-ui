import { create } from 'zustand';
import eduApi from '@/api/eduApi';
import MAIL_ENDPOINT from '@/components/feature/Home/Notification/mail-endpoint';
import Mail from '@/components/feature/Home/Notification/mail';

interface MailStore {
  mails: Mail[];
  isFetchingMails: boolean;
  errorFetchingMails: Error | null;
  fetchMails: () => Promise<Mail[]>;

  reset: () => void;
}

const initialState: Partial<MailStore> = {
  mails: [],
  isFetchingMails: false,
  errorFetchingMails: null,
};

const useMailStore = create<MailStore>((set) => ({
  ...(initialState as MailStore),
  fetchMails: async (): Promise<Mail[]> => {
    set({ errorFetchingMails: null, isFetchingMails: true });
    try {
      const response = await eduApi.get<Mail[]>(MAIL_ENDPOINT);
      const mails = response.data;
      set({ mails: mails, isFetchingMails: false });
      return mails;
    } catch (error) {
      set({ mails: [], errorFetchingMails: error, isFetchingMails: false });
      return [];
    }
  },
  reset: () => set(initialState),
}));

export default useMailStore;
