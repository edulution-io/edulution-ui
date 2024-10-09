import { create } from 'zustand';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import useLmnApiStore from '@/store/useLmnApiStore';
import LMN_API_EDU_API_ENDPOINTS from '@libs/lmnApi/constants/eduApiEndpoints';
import LmnApiStore from '@libs/lmnApi/types/lmnApiPasswordStore';
import { toast } from 'sonner';
import i18n from '@/i18n';
import { HTTP_HEADERS } from '@libs/common/types/http-methods';

const { CHANGE_PASSWORD, FIRST_PASSWORD } = LMN_API_EDU_API_ENDPOINTS;

const initialState = {
  isLoading: false,
  error: null,
  currentUser: null,
};

const useLmnApiPasswordStore = create<LmnApiStore>((set) => ({
  ...initialState,

  setCurrentUser(currentUser) {
    set({ currentUser });
  },

  setFirstPassword: async (username, password) => {
    set({ error: null, isLoading: true });
    try {
      const { lmnApiToken } = useLmnApiStore.getState();
      await eduApi.put(
        FIRST_PASSWORD,
        {
          username,
          password,
        },
        {
          headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
        },
      );
      toast.success(i18n.t('classmanagement.firstPasswordChangedSuccessfully'));
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },

  setCurrentPassword: async (username, password) => {
    set({ error: null, isLoading: true });
    try {
      const { lmnApiToken } = useLmnApiStore.getState();
      await eduApi.post(
        CHANGE_PASSWORD,
        {
          username,
          password,
        },
        {
          headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
        },
      );
      toast.success(i18n.t('classmanagement.currentPasswordChangedSuccessfully'));
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },

  reset: () => set({ ...initialState }),
}));

export default useLmnApiPasswordStore;
