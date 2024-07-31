import { create } from 'zustand';
import MAIL_PATH from '@libs/dashboard/constants/mail-endpoint';
import MailDto from '@libs/dashboard/types/mail.dto';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';

interface MailStore {
  mails: MailDto[];
  getMails: () => Promise<MailDto[]>;
  isLoading: boolean;
  fetchedNewMails: boolean;
  reset: () => void;
}

const initialState: Partial<MailStore> = {
  mails: [],
  isLoading: false,
  fetchedNewMails: false,
};

const useMailStore = create<MailStore>((set) => ({
  ...(initialState as MailStore),
  getMails: async (): Promise<MailDto[]> => {
    set({ isLoading: true, fetchedNewMails: false });
    try {
      const response = await eduApi.get<MailDto[]>(MAIL_PATH);
      const mails = response.data;
      set({ mails, fetchedNewMails: mails.length > 0 });
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
