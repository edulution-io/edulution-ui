import { create } from 'zustand';
import eduApi from '@/api/eduApi';
import Mail from '@/lib/src/notification/types/mail';
import mockedMails from '@/components/feature/Home/CurrentAffairs/components/mocked-values/mocked-mails';
import MAIL_ENDPOINT from '@/components/feature/Home/Notification/mail-endpoint';

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
      const response = await eduApi.get<Mail[]>(MAIL_ENDPOINT + 'mails/');
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

export default useMailStore;
