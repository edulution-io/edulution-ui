import { create } from 'zustand';
import { FaStarOfLife } from 'react-icons/fa';
import MAIL_ENDPOINT from '@libs/dashboard/feed/mails/constants/mail-endpoint';
import MailDto from '@libs/dashboard/feed/mails/types/mail.dto';
import { APPS } from '@libs/appconfig/types';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';

import { SidebarNotification } from '@libs/dashboard/types/sidebar-notification';

interface MailStore {
  mails: MailDto[];
  getMails: (
    updateAppData: (apps: APPS, notification: SidebarNotification) => void,
    resetAppData: (apps: APPS) => void,
  ) => Promise<void>;
  isLoading: boolean;
  reset: () => void;
}

const initialState: Partial<MailStore> = {
  mails: [],
  isLoading: false,
};

const useMailStore = create<MailStore>((set) => ({
  ...(initialState as MailStore),
  getMails: async (
    updateAppData: (apps: APPS, notification: SidebarNotification) => void,
    resetAppData: (apps: APPS) => void,
  ): Promise<void> => {
    set({ isLoading: true });
    try {
      const response = await eduApi.get<MailDto[]>(MAIL_ENDPOINT);
      const mails = response.data;
      updateAppData(APPS.MAIL, {
        show: mails.length > 0,
        icon: FaStarOfLife,
        iconColor: 'text-ciLightGreen',
        iconSize: 13,
        count: mails.length,
      });
      set({ mails });
    } catch (error) {
      resetAppData(APPS.MAIL);
      set({ mails: [] });
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },
  reset: () => set(initialState),
}));

export default useMailStore;
