import { create } from 'zustand';
import MAIL_ENDPOINT from '@libs/dashboard/feed/mails/constants/mail-endpoint';
import MailDto from '@libs/dashboard/feed/mails/types/mail.dto';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import MailStore from '@libs/dashboard/feed/mails/types/mailsStore';
import MailStoreInitialState from '@libs/dashboard/feed/mails/types/mailsStoreInitialState';

const useMailsStore = create<MailStore>((set) => ({
  ...(MailStoreInitialState as MailStore),
  reset: () => set(MailStoreInitialState),

  getMails: async (): Promise<void> => {
    set({ isLoading: true });
    try {
      const response = await eduApi.get<MailDto[]>(MAIL_ENDPOINT);
      const mails = response.data;
      set({ mails });
    } catch (error) {
      set({ mails: [] });
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useMailsStore;
