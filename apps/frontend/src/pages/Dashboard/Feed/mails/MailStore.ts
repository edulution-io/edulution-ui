import { create } from 'zustand';
import MAIL_ENDPOINT from '@libs/dashboard/constants/mail-endpoint';
import MailDto from '@libs/dashboard/types/mail.dto';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';

interface MailStore {
  mails: MailDto[];
  getMails: () => Promise<MailDto[]>;
  isLoading: boolean;

  reset: () => void;
}

const initialState: Partial<MailStore> = {
  mails: [],
  isLoading: false,
};

const useMailStore = create<MailStore>((set) => ({
  ...(initialState as MailStore),
  getMails: async (): Promise<MailDto[]> => {
    set({ isLoading: true });
    try {
      const response = await eduApi.get<MailDto[]>(MAIL_ENDPOINT);
      const mails = response.data;
      set({ mails });
      return mails;
    } catch (error) {
      handleApiError(error, set);
      return [];
    } finally {
      set({ isLoading: false });
    }
  },
  reset: () => set(initialState),
}));

export default useMailStore;
