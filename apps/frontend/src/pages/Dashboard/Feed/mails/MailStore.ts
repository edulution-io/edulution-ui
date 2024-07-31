import { create } from 'zustand';
import MAIL_PATH from '@libs/dashboard/constants/mail-endpoint';
import MailDto from '@libs/dashboard/types/mail.dto';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import { APPS } from "@libs/appconfig/types";

interface MailStore {
  mails: MailDto[];
  getMails: (updateAppData: (apps: APPS, notification: Notification) => void, resetAppData: (apps: APPS) => void) => Promise<void>;
  isLoading: boolean;
  reset: () => void;
}

const initialState: Partial<MailStore> = {
  mails: [],
  isLoading: false,
};

const useMailStore = create<MailStore>((set) => ({
  ...(initialState as MailStore),
  getMails: async (updateAppData: (apps: APPS, notification: Notification) => void, resetAppData: (apps: APPS) => void): Promise<void> => {
    set({ isLoading: true });
    try {
      const response = await eduApi.get<MailDto[]>(MAIL_PATH)
        .then((res) => {
          console.log(res)
          return res;
        });
      const mails = response.data;
      set({ mails });
      updateAppData(APPS.MAIL, { active: true, count: mails.length });
    } catch (error) {
      set({ mails: [] });
      resetAppData(APPS.MAIL);
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },
  reset: () => set(initialState),
}));

export default useMailStore;
