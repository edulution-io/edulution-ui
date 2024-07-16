import { create } from 'zustand';
import MAIL_ENDPOINT from '@libs/dashboard/constants/mail-endpoint';
import MailDto from '@libs/dashboard/types/mail.dto';
import eduApi from '@/api/eduApi';

interface MailStore {
  mails: MailDto[];
  getMails: () => Promise<MailDto[]>;
  isLoading: boolean;
  error: Error | null;

  reset: () => void;
}

const initialState: Partial<MailStore> = {
  mails: [],
  isLoading: false,
  error: null,
};

const useMailStore = create<MailStore>((set) => ({
  ...(initialState as MailStore),
  getMails: async (): Promise<MailDto[]> => {
    set({ error: null, isLoading: true });
    try {
      const response = await eduApi.get<MailDto[]>(MAIL_ENDPOINT);
      const mails = response.data;
      set({ mails: mails, isLoading: false });
      return mails;
    } catch (error) {
      console.log(error);
      set({ mails: [], error: error, isLoading: false });
      return [];
    }
  },
  reset: () => set(initialState),
}));

export default useMailStore;
