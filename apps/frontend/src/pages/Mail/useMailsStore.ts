import { create } from 'zustand';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import MailsStore from '@libs/mail/types/mailsStore';
import { MAILS_PATH } from '@libs/userSettings/constants/user-settings-endpoints';
import MailProviderConfigDto from '@libs/mail/types/mailProviderConfig.dto';

const MailStoreInitialState = {
  isLoading: false,
  externalMailProviderConfig: [],
  error: null,
  reset: () => {},
};

const useMailsStore = create<MailsStore>((set) => ({
  ...MailStoreInitialState,
  reset: () => set(MailStoreInitialState),

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
      await eduApi.post(`${MAILS_PATH}/provider-config`, mailProviderConfig);
    } catch (error) {
      handleApiError(error, set, 'mailProviderConfigError');
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useMailsStore;
