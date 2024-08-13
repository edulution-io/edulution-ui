import { create } from 'zustand';
import MAIL_ENDPOINT from '@libs/mail/constants/mail-endpoint';
import MailDto from '@libs/mail/types/mail.dto';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import MailsStore from '@libs/mail/types/mailsStore';
import MailStoreInitialState from '@libs/mail/constants/mailsStoreInitialState';
import { MAILS_PATH } from '@libs/userSettings/constants/user-settings-endpoints';
import MailProviderConfigDto from '@libs/mail/types/mailProviderConfig.dto';

const useMailsStore = create<MailsStore>((set) => ({
  ...MailStoreInitialState,
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

  getExternalMailProviderConfig: async () => {
    set({ isLoading: true });
    try {
      const response = await eduApi.get<MailProviderConfigDto[]>(`${MAILS_PATH}/provider-config`);
      set({ externalMailProviderConfig: response.data });
    } catch (error) {
      handleApiError(error, set, 'mailProviderConfigError');
    } finally {
      set({ isLoading: false });
    }
  },

  postExternalMailProviderConfig: async (mailProviderConfig: MailProviderConfigDto) => {
    set({ isLoading: true });
    try {
      const response = await eduApi.post<MailProviderConfigDto[]>(`${MAILS_PATH}/provider-config`, mailProviderConfig);
      set({ externalMailProviderConfig: response.data });
    } catch (error) {
      handleApiError(error, set, 'mailProviderConfigError');
    } finally {
      set({ isLoading: false });
    }
  },

  deleteExternalMailProviderConfig: async (mailProviderId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await eduApi.delete<MailProviderConfigDto[]>(`${MAILS_PATH}/provider-config/${mailProviderId}`);
      set({ externalMailProviderConfig: response.data });
    } catch (e) {
      handleApiError(e, set, 'mailProviderConfigError');
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useMailsStore;
