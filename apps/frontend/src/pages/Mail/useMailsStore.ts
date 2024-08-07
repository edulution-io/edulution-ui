import { create } from 'zustand';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import MailsStore from '@libs/mails/types/mailsStore';
import { MAILS_PATH } from '@libs/userSettings/constants/user-settings-endpoints';
import MailProviderConfigDto from '@libs/mails/types/mailProviderConfig.dto';

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
}));

export default useMailsStore;
